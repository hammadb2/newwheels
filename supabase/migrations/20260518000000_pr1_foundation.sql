-- PR1 — CRM foundation: internal lead notes, SIN encryption + audit, verified leads,
-- dealer data-sharing agreement.
--
-- This migration is strictly ADDITIVE — it only creates new tables / columns /
-- policies. No existing column types or constraints are altered, so it is
-- safe to apply against the live `nw` schema.
--
-- Conventions follow 20260516000000_crm_init.sql:
--   * everything lives in the `nw` schema
--   * UUIDs, timestamptz, integer cents
--   * RLS enabled + forced on every new table

-- =====================================================================
-- LEAD NOTES — internal threaded notes on a lead.
-- Never shown to buyers. Visible to CEO, Lead Qualifier (own assignments),
-- Platform Ops, BDR, and HR (read-only).
-- =====================================================================

create table if not exists nw.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references nw.leads(id) on delete cascade,
  author_team_member_id uuid references nw.team_members(id) on delete set null,
  parent_note_id uuid references nw.lead_notes(id) on delete cascade,
  body text not null check (char_length(body) > 0 and char_length(body) <= 4000),
  edited_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists lead_notes_lead_idx on nw.lead_notes(lead_id, created_at desc);
create index if not exists lead_notes_author_idx on nw.lead_notes(author_team_member_id);
create index if not exists lead_notes_parent_idx on nw.lead_notes(parent_note_id);

alter table nw.lead_notes enable row level security;
alter table nw.lead_notes force row level security;

-- CEO + Ops full access.
drop policy if exists lead_notes_ceo_all on nw.lead_notes;
create policy lead_notes_ceo_all on nw.lead_notes
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists lead_notes_ops_all on nw.lead_notes;
create policy lead_notes_ops_all on nw.lead_notes
  for all using (nw.current_role_name() = 'platform_ops')
              with check (nw.current_role_name() = 'platform_ops');

-- Lead Qualifier can read + write notes on leads they're assigned to or
-- unassigned leads (matches existing leads_qualifier_* policies).
drop policy if exists lead_notes_qualifier_rw on nw.lead_notes;
create policy lead_notes_qualifier_rw on nw.lead_notes
  for all using (
    nw.current_role_name() = 'lead_qualifier'
    and exists (
      select 1 from nw.leads l
      where l.id = lead_notes.lead_id
        and (l.assigned_qualifier_id = nw.current_team_member() or l.assigned_qualifier_id is null)
    )
  ) with check (
    nw.current_role_name() = 'lead_qualifier'
    and author_team_member_id = nw.current_team_member()
  );

-- HR + BDR can read notes for performance review but not write.
drop policy if exists lead_notes_hr_read on nw.lead_notes;
create policy lead_notes_hr_read on nw.lead_notes
  for select using (nw.current_role_name() in ('hr', 'bdr'));

-- =====================================================================
-- VERIFIED LEAD FLAG + SIN STORAGE
-- A "verified" lead has uploaded driver's licence, work permit (if applicable),
-- proof of income, and SIN. Verified leads earn a starting-price premium —
-- see src/lib/crm/scoring.ts startingPriceCentsForTier(tier, verified).
-- =====================================================================

alter table nw.leads
  add column if not exists verified boolean not null default false,
  add column if not exists verified_at timestamptz,
  add column if not exists sin_encrypted text;   -- AES-256-GCM payload: base64(iv).base64(tag).base64(ciphertext)

create index if not exists leads_verified_idx on nw.leads(verified) where verified = true;

-- =====================================================================
-- SIN AUDIT LOG
-- Tamper-evident log of every SIN write / reveal. CEO read-only; the
-- application is the only writer (service-role).
-- =====================================================================

create table if not exists nw.sin_audit_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references nw.leads(id) on delete cascade,
  -- actor identification — exactly one of the two columns is non-null.
  actor_kind text not null check (actor_kind in ('team_member', 'buyer')),
  team_member_id uuid references nw.team_members(id) on delete set null,
  buyer_account_id uuid references nw.buyer_accounts(id) on delete set null,
  -- 'sin_set' | 'sin_revealed' | 'sin_cleared'
  event text not null check (event in ('sin_set', 'sin_revealed', 'sin_cleared')),
  ip_address text,
  user_agent text,
  detail jsonb,
  created_at timestamptz not null default now(),
  constraint sin_audit_actor_check check (
    (actor_kind = 'team_member' and team_member_id is not null and buyer_account_id is null) or
    (actor_kind = 'buyer'       and buyer_account_id is not null and team_member_id is null)
  )
);

create index if not exists sin_audit_lead_idx on nw.sin_audit_log(lead_id, created_at desc);
create index if not exists sin_audit_buyer_idx on nw.sin_audit_log(buyer_account_id);
create index if not exists sin_audit_team_idx on nw.sin_audit_log(team_member_id);
create index if not exists sin_audit_event_idx on nw.sin_audit_log(event);

alter table nw.sin_audit_log enable row level security;
alter table nw.sin_audit_log force row level security;

-- CEO read-only — even CEO cannot delete audit rows (no `delete` policy).
drop policy if exists sin_audit_ceo_read on nw.sin_audit_log;
create policy sin_audit_ceo_read on nw.sin_audit_log
  for select using (nw.is_ceo());

-- =====================================================================
-- BUYER DATA-SHARING AGREEMENT (required before any SIN reveal)
-- =====================================================================

alter table nw.buyer_accounts
  add column if not exists sin_reveal_agreement_at timestamptz,
  add column if not exists sin_reveal_agreement_signed_by text;  -- the actor's display name at sign time
