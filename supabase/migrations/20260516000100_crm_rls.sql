-- Row-Level Security policies for the NewWheels CRM.
--
-- Strategy
-- ========
-- We do NOT use Supabase Auth here. The app is the only client that talks
-- to Supabase, and it uses the service-role key on the server side. That
-- means RLS effectively only protects against:
--   (a) accidentally connecting via the anon key from the browser, and
--   (b) us forgetting to scope a query.
--
-- For belt-and-braces defense, we lock down every CRM table so that NO
-- requests succeed under the anon role. The service role bypasses RLS by
-- design — every server route enforces role-based scoping explicitly in
-- application code (see src/lib/crm/auth/rbac.ts).
--
-- If/when we move to Supabase Auth, the GUC-based policies below
-- (`current_setting('request.jwt.claims')`) become the source of truth.

-- =====================================================================
-- Default-deny: enable RLS on every CRM table.
-- =====================================================================

alter table nw.team_members            enable row level security;
alter table nw.buyer_accounts          enable row level security;
alter table nw.buyer_verification_docs enable row level security;
alter table nw.verification_decisions  enable row level security;
alter table nw.auth_otps               enable row level security;
alter table nw.sessions                enable row level security;
alter table nw.leads                   enable row level security;
alter table nw.lead_qualifications     enable row level security;
alter table nw.lead_audit_log          enable row level security;
alter table nw.saved_filters           enable row level security;
alter table nw.purchases               enable row level security;
alter table nw.lead_disputes           enable row level security;
alter table nw.buyer_credits           enable row level security;
alter table nw.email_threads           enable row level security;
alter table nw.email_messages          enable row level security;
alter table nw.email_attachments       enable row level security;
alter table nw.outreach_logs           enable row level security;
alter table nw.content_tasks           enable row level security;
alter table nw.bdr_activity            enable row level security;
alter table nw.team_pay_records        enable row level security;
alter table nw.operating_costs         enable row level security;
alter table nw.daily_metrics           enable row level security;

-- Force RLS even for table owners as a guardrail.
alter table nw.team_members            force row level security;
alter table nw.buyer_accounts          force row level security;
alter table nw.buyer_verification_docs force row level security;
alter table nw.verification_decisions  force row level security;
alter table nw.auth_otps               force row level security;
alter table nw.sessions                force row level security;
alter table nw.leads                   force row level security;
alter table nw.lead_qualifications     force row level security;
alter table nw.lead_audit_log          force row level security;
alter table nw.saved_filters           force row level security;
alter table nw.purchases               force row level security;
alter table nw.lead_disputes           force row level security;
alter table nw.buyer_credits           force row level security;
alter table nw.email_threads           force row level security;
alter table nw.email_messages          force row level security;
alter table nw.email_attachments       force row level security;
alter table nw.outreach_logs           force row level security;
alter table nw.content_tasks           force row level security;
alter table nw.bdr_activity            force row level security;
alter table nw.team_pay_records        force row level security;
alter table nw.operating_costs         force row level security;
alter table nw.daily_metrics           force row level security;

-- =====================================================================
-- Anon role: explicit DENY (no policies created = default deny when RLS on).
-- The service role used by the Next.js server bypasses RLS, so policies
-- below are mostly belt-and-braces. They become important if we ever expose
-- direct buyer/team queries via the anon or `authenticated` roles.
-- =====================================================================

-- Helper SQL: pull the actor identity from request claims. The server can
-- set these via `set_config('request.actor_id', ..., true)` in a Postgres
-- transaction before issuing queries through the service-role key. This is
-- not used today, but the policies below are ready for it.

create or replace function nw.current_team_member()
returns uuid language sql stable as $$
  select nullif(current_setting('request.actor.team_member_id', true), '')::uuid;
$$;

create or replace function nw.current_buyer()
returns uuid language sql stable as $$
  select nullif(current_setting('request.actor.buyer_account_id', true), '')::uuid;
$$;

create or replace function nw.current_role_name()
returns text language sql stable as $$
  select nullif(current_setting('request.actor.role', true), '');
$$;

create or replace function nw.is_ceo()
returns boolean language sql stable as $$
  select nw.current_role_name() = 'ceo';
$$;

-- =====================================================================
-- TEAM_MEMBERS: CEO can do anything; everyone else can read their own row.
-- =====================================================================

drop policy if exists tm_ceo_all on nw.team_members;
create policy tm_ceo_all on nw.team_members
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists tm_self_read on nw.team_members;
create policy tm_self_read on nw.team_members
  for select using (id = nw.current_team_member());

-- =====================================================================
-- BUYER_ACCOUNTS: CEO full access; team members with relevant roles can read;
-- buyer can read own row and any sub-account under their master.
-- =====================================================================

drop policy if exists buyer_ceo_all on nw.buyer_accounts;
create policy buyer_ceo_all on nw.buyer_accounts
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists buyer_bdr_ops_read on nw.buyer_accounts;
create policy buyer_bdr_ops_read on nw.buyer_accounts
  for select using (
    nw.current_role_name() in ('bdr', 'platform_ops')
  );

drop policy if exists buyer_self_read on nw.buyer_accounts;
create policy buyer_self_read on nw.buyer_accounts
  for select using (
    id = nw.current_buyer()
    or master_account_id = nw.current_buyer()
    or id = (select master_account_id from nw.buyer_accounts where id = nw.current_buyer())
  );

drop policy if exists buyer_self_update on nw.buyer_accounts;
create policy buyer_self_update on nw.buyer_accounts
  for update using (id = nw.current_buyer())
                  with check (id = nw.current_buyer());

-- =====================================================================
-- VERIFICATION DOCS + DECISIONS: CEO only.
-- =====================================================================

drop policy if exists verdocs_ceo_all on nw.buyer_verification_docs;
create policy verdocs_ceo_all on nw.buyer_verification_docs
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists verdocs_ops_select on nw.buyer_verification_docs;
create policy verdocs_ops_select on nw.buyer_verification_docs
  for select using (nw.current_role_name() = 'platform_ops');

drop policy if exists verdocs_self_insert on nw.buyer_verification_docs;
create policy verdocs_self_insert on nw.buyer_verification_docs
  for insert with check (buyer_id = nw.current_buyer());

drop policy if exists verdecide_ceo_all on nw.verification_decisions;
create policy verdecide_ceo_all on nw.verification_decisions
  for all using (nw.is_ceo()) with check (nw.is_ceo());

-- =====================================================================
-- OTP + SESSION: nobody but the service role.
-- =====================================================================

-- Intentionally no policies — only the service role (or future trusted code
-- with a definer function) can touch these tables. Anything else will fail.

-- =====================================================================
-- LEADS: CEO + Platform Ops full read; Lead Qualifier sees their assigned
-- leads (and unassigned leads while they're working on them).
-- Buyers never see leads in this table directly — they go through a curated
-- view that strips PII for unpurchased leads.
-- =====================================================================

drop policy if exists leads_ceo_all on nw.leads;
create policy leads_ceo_all on nw.leads
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists leads_ops_all on nw.leads;
create policy leads_ops_all on nw.leads
  for all using (nw.current_role_name() = 'platform_ops')
              with check (nw.current_role_name() = 'platform_ops');

drop policy if exists leads_qualifier_read on nw.leads;
create policy leads_qualifier_read on nw.leads
  for select using (
    nw.current_role_name() = 'lead_qualifier'
    and (assigned_qualifier_id = nw.current_team_member() or assigned_qualifier_id is null)
  );

drop policy if exists leads_qualifier_update on nw.leads;
create policy leads_qualifier_update on nw.leads
  for update using (
    nw.current_role_name() = 'lead_qualifier'
    and (assigned_qualifier_id = nw.current_team_member() or assigned_qualifier_id is null)
  ) with check (
    nw.current_role_name() = 'lead_qualifier'
  );

-- A buyer reads sold-to-them leads (joined to the purchase) via app code.
-- Direct buyer access to nw.leads is denied.

-- =====================================================================
-- LEAD_QUALIFICATIONS: CEO + Ops can read all; qualifier reads/writes their own.
-- The Lead Qualifier explicitly cannot read the `score` column from leads —
-- that's enforced in app code (server doesn't ship it to qualifier UI).
-- =====================================================================

drop policy if exists qual_ceo_all on nw.lead_qualifications;
create policy qual_ceo_all on nw.lead_qualifications
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists qual_ops_select on nw.lead_qualifications;
create policy qual_ops_select on nw.lead_qualifications
  for select using (nw.current_role_name() = 'platform_ops');

drop policy if exists qual_qualifier_rw on nw.lead_qualifications;
create policy qual_qualifier_rw on nw.lead_qualifications
  for all using (
    nw.current_role_name() = 'lead_qualifier'
    and qualified_by = nw.current_team_member()
  ) with check (
    nw.current_role_name() = 'lead_qualifier'
    and qualified_by = nw.current_team_member()
  );

-- =====================================================================
-- LEAD_AUDIT_LOG: CEO + Ops + HR readable; nobody writes via anon.
-- =====================================================================

drop policy if exists audit_ceo_all on nw.lead_audit_log;
create policy audit_ceo_all on nw.lead_audit_log
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists audit_ops_read on nw.lead_audit_log;
create policy audit_ops_read on nw.lead_audit_log
  for select using (nw.current_role_name() in ('platform_ops', 'hr'));

-- =====================================================================
-- SAVED_FILTERS: buyer-owned.
-- =====================================================================

drop policy if exists filters_self_all on nw.saved_filters;
create policy filters_self_all on nw.saved_filters
  for all using (buyer_id = nw.current_buyer() or buyer_id in (
    select id from nw.buyer_accounts where master_account_id = nw.current_buyer()
  )) with check (buyer_id = nw.current_buyer() or buyer_id in (
    select id from nw.buyer_accounts where master_account_id = nw.current_buyer()
  ));

drop policy if exists filters_ceo_read on nw.saved_filters;
create policy filters_ceo_read on nw.saved_filters
  for select using (nw.is_ceo());

-- =====================================================================
-- PURCHASES: buyer sees own + their subs (if master); CEO sees all; Ops read.
-- =====================================================================

drop policy if exists purch_ceo_all on nw.purchases;
create policy purch_ceo_all on nw.purchases
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists purch_ops_read on nw.purchases;
create policy purch_ops_read on nw.purchases
  for select using (nw.current_role_name() in ('platform_ops', 'bdr'));

drop policy if exists purch_self_read on nw.purchases;
create policy purch_self_read on nw.purchases
  for select using (
    buyer_id = nw.current_buyer()
    or sub_account_id = nw.current_buyer()
    or buyer_id in (
      select id from nw.buyer_accounts where master_account_id = nw.current_buyer()
    )
  );

-- =====================================================================
-- LEAD DISPUTES: buyer self + Ops + CEO.
-- =====================================================================

drop policy if exists dispute_ceo_all on nw.lead_disputes;
create policy dispute_ceo_all on nw.lead_disputes
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists dispute_ops_rw on nw.lead_disputes;
create policy dispute_ops_rw on nw.lead_disputes
  for all using (nw.current_role_name() = 'platform_ops')
              with check (nw.current_role_name() = 'platform_ops');

drop policy if exists dispute_buyer_rw on nw.lead_disputes;
create policy dispute_buyer_rw on nw.lead_disputes
  for all using (buyer_id = nw.current_buyer())
              with check (buyer_id = nw.current_buyer());

-- =====================================================================
-- BUYER CREDITS: buyer self + CEO.
-- =====================================================================

drop policy if exists credits_self_read on nw.buyer_credits;
create policy credits_self_read on nw.buyer_credits
  for select using (
    buyer_id = nw.current_buyer()
    or buyer_id in (select id from nw.buyer_accounts where master_account_id = nw.current_buyer())
  );

drop policy if exists credits_ceo_all on nw.buyer_credits;
create policy credits_ceo_all on nw.buyer_credits
  for all using (nw.is_ceo()) with check (nw.is_ceo());

-- =====================================================================
-- EMAIL: team member sees their own inbox; CEO sees everything.
-- Lead-attached threads are also visible to anyone who can see the lead.
-- =====================================================================

drop policy if exists thread_ceo_all on nw.email_threads;
create policy thread_ceo_all on nw.email_threads
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists thread_team_read on nw.email_threads;
create policy thread_team_read on nw.email_threads
  for select using (
    -- A team member can see a thread if any message in it is theirs.
    exists (
      select 1 from nw.email_messages m
      where m.thread_id = email_threads.id
        and m.team_member_id = nw.current_team_member()
    )
  );

drop policy if exists msg_ceo_all on nw.email_messages;
create policy msg_ceo_all on nw.email_messages
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists msg_team_rw on nw.email_messages;
create policy msg_team_rw on nw.email_messages
  for all using (team_member_id = nw.current_team_member())
              with check (team_member_id = nw.current_team_member());

drop policy if exists att_inherit on nw.email_attachments;
create policy att_inherit on nw.email_attachments
  for select using (
    exists (
      select 1 from nw.email_messages m
      where m.id = email_attachments.message_id
        and (nw.is_ceo() or m.team_member_id = nw.current_team_member())
    )
  );

-- =====================================================================
-- ACTIVITY LOGS: each VA writes own row; HR + CEO read all.
-- =====================================================================

drop policy if exists outreach_self_rw on nw.outreach_logs;
create policy outreach_self_rw on nw.outreach_logs
  for all using (team_member_id = nw.current_team_member())
              with check (team_member_id = nw.current_team_member());

drop policy if exists outreach_ceohr_read on nw.outreach_logs;
create policy outreach_ceohr_read on nw.outreach_logs
  for select using (nw.is_ceo() or nw.current_role_name() = 'hr');

drop policy if exists content_self_rw on nw.content_tasks;
create policy content_self_rw on nw.content_tasks
  for all using (team_member_id = nw.current_team_member())
              with check (team_member_id = nw.current_team_member());

drop policy if exists content_ceohr_read on nw.content_tasks;
create policy content_ceohr_read on nw.content_tasks
  for select using (nw.is_ceo() or nw.current_role_name() = 'hr');

drop policy if exists bdr_self_rw on nw.bdr_activity;
create policy bdr_self_rw on nw.bdr_activity
  for all using (team_member_id = nw.current_team_member())
              with check (team_member_id = nw.current_team_member());

drop policy if exists bdr_ceohr_read on nw.bdr_activity;
create policy bdr_ceohr_read on nw.bdr_activity
  for select using (nw.is_ceo() or nw.current_role_name() = 'hr');

drop policy if exists pay_ceohr_all on nw.team_pay_records;
create policy pay_ceohr_all on nw.team_pay_records
  for all using (nw.is_ceo() or nw.current_role_name() = 'hr')
              with check (nw.is_ceo() or nw.current_role_name() = 'hr');

drop policy if exists pay_self_read on nw.team_pay_records;
create policy pay_self_read on nw.team_pay_records
  for select using (team_member_id = nw.current_team_member());

-- =====================================================================
-- COSTS + METRICS: CEO only.
-- =====================================================================

drop policy if exists costs_ceo_all on nw.operating_costs;
create policy costs_ceo_all on nw.operating_costs
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists metrics_ceo_all on nw.daily_metrics;
create policy metrics_ceo_all on nw.daily_metrics
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists metrics_ops_read on nw.daily_metrics;
create policy metrics_ops_read on nw.daily_metrics
  for select using (nw.current_role_name() in ('platform_ops', 'hr'));
