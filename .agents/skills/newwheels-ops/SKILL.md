---
name: newwheels-ops
description: Operations runbook for the NewWheels CRM + lead marketplace. Use when running schema migrations, debugging Supabase/Vercel/Resend/Stripe integrations, bootstrapping team members, or smoke-testing auth, marketplace, and email flows.
---

# NewWheels CRM ops runbook

This codebase is a single Next.js 16 app that serves three subdomains via
`src/proxy.ts`:

| Host                  | Routes to    | Audience            |
|-----------------------|--------------|---------------------|
| `newwheels.ca`        | `/*` (apex)  | Marketing + lead intake |
| `crm.newwheels.ca`    | `/crm/*`     | Internal team       |
| `portal.newwheels.ca` | `/portal/*`  | Buyers (dealers + individuals) |

Database is Supabase Postgres. All app tables live in the **`nw` schema** (NOT
`public`). Email is Resend (system + team inbox). Payments are Stripe.

## Reaching the database

The direct connection (`db.<ref>.supabase.co:5432`) is **IPv6 only** — most
sandboxes / CI runners can't reach it. Use the connection pooler hostname
(`aws-0-<region>.pooler.supabase.com:5432`, session mode) which has IPv4 A
records. The pooler URI is in the org-scoped secret `SUPABASE_POOLER_URL`.

```bash
# Sanity check
psql "$SUPABASE_POOLER_URL" -c "select current_database(), version();"
```

Use **session mode (port 5432)**, not transaction mode (6543), for any DDL or
multi-statement script — transaction mode drops support for prepared statements
and breaks `\d` and some `psql` features.

## Running migrations

Migrations live in `supabase/migrations/*.sql`. They are plain SQL — apply with
`psql -v ON_ERROR_STOP=1 --single-transaction -f <file>` so any error rolls
back the whole file:

```bash
for f in supabase/migrations/*.sql; do
  psql "$SUPABASE_POOLER_URL" -v ON_ERROR_STOP=1 --single-transaction -f "$f"
done
```

The migrations are idempotent (`drop policy if exists`, `create or replace`,
etc.) so re-running is safe.

## The schema-exposure gotcha

Supabase's PostgREST only serves schemas listed in **Settings → API → Exposed
schemas** (dashboard). Setting `pgrst.db_schemas` via `ALTER ROLE authenticator`
*does* land in the database (you can verify via `pg_db_role_setting`) but
**Supabase's hosted PostgREST overrides it** with the dashboard config. If
`nw` isn't in the dashboard list, every JS-SDK call from the app to a
`nw.*` table returns `{ data: null, error: PGRST106 }` and the app silently
treats it as "no row found".

**Symptom**: API routes return `{"ok": true}` HTTP 200 (because handlers
defensively return ok on lookup-miss to avoid leaking enumeration), but no
rows ever get inserted into `nw.auth_otps`, no leads land in `nw.leads`,
etc.

**Fix**: Supabase dashboard → Settings → API → Exposed schemas → add `nw` →
Save. No code change. Wait ~10s for PostgREST to reload.

## Storage bucket

The verification-doc upload flow expects a **private** `verification-docs`
bucket with a 10 MB size cap and only image/PDF MIME types:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'verification-docs', 'verification-docs', false, 10485760,
  array['image/png','image/jpeg','image/webp','image/heic','application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
```

Buyer signups upload through the app server using the service-role key, and
CEO review fetches via signed URLs from `nw.buyer_verification_docs`. The
bucket itself never needs to be public.

## Bootstrapping a CEO / team member

OTP login requires a row in `nw.team_members` with `active = true`. Real
column names (NOT what the spec calls them):

| Spec name      | Actual column      |
|----------------|--------------------|
| Full name      | `display_name`     |
| Login email    | `email` (citext)   |
| Mailbox alias  | `team_email`       |
| Role           | `role` (enum `nw.team_role`) |

Valid `nw.team_role` values: `ceo`, `lead_qualifier`, `community_outreach`,
`content_seo`, `bdr`, `platform_ops`, `hr`.

```sql
insert into nw.team_members (email, display_name, role, team_email, active)
values ('hammad@newwheels.ca', 'Hammad Bhatti', 'ceo', 'hello@newwheels.ca', true)
on conflict (email) do update set
  display_name = excluded.display_name,
  role = excluded.role,
  team_email = excluded.team_email,
  active = excluded.active;
```

## OTP table column names (don't trust the spec)

| Wrong name (don't use) | Real name (in DB) |
|------------------------|-------------------|
| `otp_codes`            | `auth_otps`       |
| `used_at`              | `consumed_at`     |
| `kind`                 | `audience`        |

OTP codes are stored **hashed** (`code_hash`), never as plaintext. The hash is
`sha256(code + ':' + email)`; see `src/lib/crm/auth/otp.ts`.

## Smoke-testing the auth flow

```bash
# Request OTP for a known team member
curl -sS -X POST https://crm.newwheels.ca/api/crm/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"hammad@newwheels.ca"}'

# Verify the row landed (and was the FIRST one for that email in last minute)
psql "$SUPABASE_POOLER_URL" -tA -c "
  select id, audience, expires_at, attempts, created_at
  from nw.auth_otps
  where email='hammad@newwheels.ca'
  order by created_at desc limit 3;"
```

If you get `{"ok": true}` but no row — the `nw` schema isn't exposed (see
gotcha above) or the team_members row isn't active.

If the row lands but no email arrives — `RESEND_API_KEY` is unset or the
sender domain `newwheels.ca` isn't verified in Resend.

## Vercel domain setup

The marketing site (apex) is already pointed at Vercel. The CRM and portal
need their own domain entries:

1. Vercel → newwheels project → Settings → Domains → Add:
   - `crm.newwheels.ca`
   - `portal.newwheels.ca`
2. Vercel will give you a CNAME target (usually `cname.vercel-dns.com`). Add it
   at your DNS provider.
3. Wait for cert issuance (usually <5 min).

Until DNS resolves, you can still hit the API surfaces via the apex domain
(`https://newwheels.ca/api/crm/auth/request-otp`) — `proxy.ts` doesn't
rewrite the API path on the apex host.

## Resend domain setup

Two domains need to be **verified in Resend** (SPF/DKIM/DMARC):

| Domain                 | Why                                                                          | Inbound MX needed? |
|------------------------|------------------------------------------------------------------------------|--------------------|
| `newwheels.ca`         | `noreply@newwheels.ca` (all system mail), `hello@`, `legal@`                 | No                 |
| `team.newwheels.ca`    | All team mailboxes (`qualifier1@team.*`, `bdr@team.*`, etc.) AND inbound mail | **Yes**            |

`crm.newwheels.ca` and `portal.newwheels.ca` are web-only — they don't send or
receive mail and don't need anything in Resend.

For inbound (`team.newwheels.ca`), MX records point at Resend's inbound MX
hosts. The inbound webhook lives at the apex:

```
POST https://newwheels.ca/api/email/inbound
```

The handler verifies a Svix signature using `RESEND_WEBHOOK_SECRET` before
storing anything. It silently drops mail to unknown mailboxes (anything not
in `nw.team_members.email`).

## Stripe webhook setup

```
POST https://portal.newwheels.ca/api/stripe/webhook
```

(Falls back to `https://newwheels.ca/api/stripe/webhook` if portal DNS isn't
live yet — apex passes `/api/stripe/*` through untouched.)

Events to subscribe to:
- `payment_intent.payment_failed` — flips `nw.purchases.status` to `failed`,
  re-releases the lead.
- `charge.refunded` — flips `nw.purchases.status` to `refunded`.
- `charge.dispute.created` / `charge.dispute.closed` — chargeback visibility.

The signing secret (`whsec_…`) goes in `STRIPE_WEBHOOK_SECRET`. Test mode and
live mode have **different** webhook secrets — you'll need a separate endpoint
+ env var when flipping to live.

The purchase charge itself is **synchronous** (PaymentIntent with
`confirm: true`), so success doesn't depend on the webhook firing. The
webhook is purely for async failure paths and reconciliation.

## Env vars you must have set in Vercel

| Var                                  | Where it comes from                                    |
|--------------------------------------|--------------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`           | Supabase → Settings → API → Project URL                |
| `SUPABASE_ANON_KEY`                  | same page, `anon public`                               |
| `SUPABASE_SERVICE_ROLE_KEY`          | same page, `service_role` (server only)                |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys → Publishable key       |
| `STRIPE_SECRET_KEY`                  | same page, Secret key                                  |
| `STRIPE_WEBHOOK_SECRET`              | Stripe webhook endpoint → Signing secret               |
| `RESEND_API_KEY`                     | Resend → API Keys                                      |
| `RESEND_WEBHOOK_SECRET`              | Resend webhook endpoint → Signing secret               |
| `NW_SESSION_SECRET`                  | `openssl rand -base64 32` (HMAC for session cookies)   |
| `CRON_SECRET`                        | `openssl rand -base64 32` (Vercel Cron auth bearer)    |
| `NW_PORTAL_URL` *(optional)*         | Defaults to `https://portal.newwheels.ca`              |
| `NW_CRM_URL` *(optional)*            | Defaults to `https://crm.newwheels.ca`                 |

For local dev, mirror the same names in `.env.local`. The repo has
`.env.example` as a template.

## Vercel Cron cadence

`vercel.json` schedules five cron jobs but **only daily** because Vercel
Hobby plans don't allow sub-daily crons. After upgrading to Pro, tighten:

| Job                  | Hobby (today)  | Pro (target)       |
|----------------------|----------------|--------------------|
| `pricing-update`     | `5 0 * * *`    | `0 * * * *`        |
| `expire-leads`       | `15 0 * * *`   | `*/10 * * * *`     |
| `match-filters`      | `30 0 * * *`   | `*/15 * * * *`     |
| `re-engagement`      | `0 14 * * *`   | `0 14 * * *` (daily ok) |
| `low-budget-alert`   | `0 13 * * *`   | `0 13 * * *` (daily ok) |

Each cron handler authenticates the caller with
`Authorization: Bearer ${CRON_SECRET}` — Vercel injects this automatically
from `vercel.json`.

## Useful inspection queries

```sql
-- All tables in nw schema
select tablename from pg_tables where schemaname='nw' order by 1;

-- RLS coverage
select c.relname, c.relrowsecurity
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='nw' and c.relkind='r' order by 1;

-- Recent OTPs (any audience)
select email, audience, expires_at, consumed_at, created_at
from nw.auth_otps order by created_at desc limit 10;

-- Active marketplace inventory
select id, score, tier, current_price_cents, status, created_at
from nw.leads where status='available' order by score desc;

-- Verifications waiting on CEO
select id, kind, business_name, status, submitted_at
from nw.buyer_accounts where verification_status='pending';
```
