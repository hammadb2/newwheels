# newwheels.ca

Next.js 16 (App Router) + Tailwind production site for **NewWheels**, a Calgary vehicle-financing lead-generation business. Built per the NewWheels SEO Playbook.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS 3 with brand tokens
- Inter via `next/font/google` (self-hosted on Vercel)
- Resend for transactional email (lead notification + auto-reply)
- Google Sheets webhook (Apps Script) for lead pipeline
- Schema.org JSON-LD on every page

## Pages (Phase 1: 14 launch pages + blog)
- `/` - homepage (`LocalBusiness`, `WebSite`, `Organization`, `FAQPage`)
- `/bad-credit-car-loans-calgary`
- `/newcomer-car-loans-calgary`
- `/car-loan-work-permit-calgary`
- `/car-loan-after-bankruptcy-calgary`
- `/self-employed-car-loan-calgary`
- `/first-time-car-buyer-calgary`
- `/consumer-proposal-car-loan-calgary`
- `/how-it-works`
- `/about` (`Person` schema for Hammad)
- `/calculator` (`SoftwareApplication` schema, interactive sliders, Alberta no-PST callout)
- `/nissan-financing-calgary`
- `/blog` (hub) + `/blog/[slug]` (5 starter posts with `Article` + `FAQPage` + `BreadcrumbList`)
- `/privacy` (PIPEDA-compliant)

Every non-home page has `BreadcrumbList`, `FAQPage` with **6 unique questions**, plus the `LocalBusiness`/`FinancialService` schema.

## Run locally
```bash
npm install
cp .env.example .env.local
# fill in optional env vars (see below)
npm run dev
```

Visit `http://localhost:3000`. The site is fully functional with **no** env vars set. Tracking, Resend, and Sheets all gracefully no-op.

## Scripts
- `npm run dev` - local dev server
- `npm run build` - production build
- `npm run start` - serve production build
- `npm run lint` - ESLint (flat config, `eslint-config-next` 16)
- `npm run typecheck` - strict `tsc --noEmit`

## Environment variables

All env vars are **optional**. Site builds and renders without any of them, with sensible placeholder fallbacks.

### Public (browser-visible)
| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL. Default `https://newwheels.ca`. |
| `NEXT_PUBLIC_BUSINESS_PHONE` | Display phone, e.g. `(403) 555-0123`. |
| `NEXT_PUBLIC_BUSINESS_PHONE_HREF` | `tel:` href, e.g. `+14035550123`. |
| `NEXT_PUBLIC_BUSINESS_ADDRESS_STREET` | Street line for footer + LocalBusiness schema. |
| `NEXT_PUBLIC_BUSINESS_ADDRESS_POSTAL` | Postal code. |
| `NEXT_PUBLIC_AMVIC_LICENSE` | AMVIC licence number/text shown in footer. |
| `NEXT_PUBLIC_HAMMAD_LASTNAME` | Hammad's surname (used on `/about` and Person schema). |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container, `GTM-XXXX`. |
| `NEXT_PUBLIC_GA4_ID` | GA4 measurement ID, `G-XXXX`. Used as a fallback if GTM isn't set. |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Facebook Pixel. Fallback if GTM isn't set. |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity project ID. |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Google Search Console `<meta>` verification token. |

### Server-only
| Var | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Required for lead notification + auto-reply email. |
| `LEAD_FROM_EMAIL` | `From:` header for both emails. Default `NewWheels <hello@newwheels.ca>`. |
| `LEAD_NOTIFY_TO` | Where lead notifications are sent. Default `hello@newwheels.ca`. |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Google Apps Script `doPost` URL for the lead pipeline. |

## Lead pipeline
`POST /api/lead` validates the submission and **fires all three integrations in parallel** (Resend notify + Resend auto-reply + Google Sheets webhook) so end-to-end lead delivery is under 60 seconds. Each integration gracefully no-ops if its env var isn't set.

## Performance & SEO targets (per playbook)
- Mobile PageSpeed ≥ 90
- LCP < 2.5 s, CLS < 0.1
- Unique title 50-60 chars + meta description 150-160 chars on every page
- Self-referencing canonical, OG + Twitter Card, one H1 per page
- Auto-generated `sitemap.xml` (`/sitemap.ts`) covering pages + blog posts
- `robots.txt` allows all content, disallows `/api/`, `/admin/`, `/thank-you`

## Redirects (`src/proxy.ts`)
- `yourapproved.ca` (and any subdomain) → `newwheels.ca` (301)
- `www.newwheels.ca` → `newwheels.ca` (301)
- HTTPS enforcement is handled at the Vercel edge.

## Deploying to Vercel
1. Import the repo in Vercel.
2. Set the env vars above (optional, site deploys without them).
3. Add `newwheels.ca` (apex) as the primary domain.
4. Add `www.newwheels.ca` and `yourapproved.ca` as redirect domains pointing to apex.
5. Verify the GSC property using `NEXT_PUBLIC_GSC_VERIFICATION` (already injected into the `<head>`).
