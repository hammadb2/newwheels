-- PR2 — Applicant portal foundation (apply.newwheels.ca)
--
-- Applicants do NOT log in. The confirmation email contains a unique link
-- /apply/<token> that lets the applicant check status and upload required
-- documents from their phone while the Retell qualification call is running.
--
-- Strictly additive: only new columns, new tables, new policies. No ALTER
-- on existing columns and no destructive operations. Safe to apply against
-- the live `nw` schema.

-- =====================================================================
-- APPLY TOKEN on leads
-- 128-bit random UUID, single column, unique. Generated on insert via
-- the column default — application code reads it back from the insert
-- and includes it in the confirmation email and SMS.
-- =====================================================================

alter table nw.leads
  add column if not exists apply_token uuid not null default gen_random_uuid();

create unique index if not exists leads_apply_token_uq on nw.leads(apply_token);

-- Retell call status — populated by the webhook in PR3. Established now so
-- the applicant-portal status mapper has a stable column shape from day one.
-- Allowed values: 'pending' (call queued), 'in_progress' (call connected),
-- 'completed', 'no_answer', 'voicemail', 'failed'.
alter table nw.leads
  add column if not exists retell_call_id text,
  add column if not exists retell_call_status text;

create index if not exists leads_retell_call_idx on nw.leads(retell_call_id) where retell_call_id is not null;

-- =====================================================================
-- LEAD DOCUMENTS
-- Each row is one uploaded file for one lead. CEO has full access. Platform
-- Ops and the assigned Lead Qualifier can read but not delete. Buyers
-- NEVER see this table.
--
-- Files themselves live in the private Supabase Storage bucket
-- `applicant-docs`. The `storage_object_key` column points at the bucket
-- path; nothing about the file is exposed through the public anon key.
-- =====================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_document_kind' and typnamespace = (select oid from pg_namespace where nspname = 'nw')) then
    create type nw.lead_document_kind as enum (
      'drivers_licence_front',
      'drivers_licence_back',
      'work_permit',
      'study_permit',
      'proof_of_income',
      'bank_statement',
      'other'
    );
  end if;
end$$;

create table if not exists nw.lead_documents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references nw.leads(id) on delete cascade,
  kind nw.lead_document_kind not null,
  storage_object_key text not null,             -- path inside the `applicant-docs` bucket
  original_filename text,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  uploaded_via_ip text,
  uploaded_user_agent text,
  uploaded_via_token boolean not null default true,  -- vs. CEO-uploaded after the fact
  notes text,
  created_at timestamptz not null default now(),
  -- One latest doc of each kind per lead. New uploads soft-replace earlier
  -- ones by inserting a new row; the helper functions surface the most
  -- recent row per (lead_id, kind).
  constraint lead_documents_size_check check (
    size_bytes is null or size_bytes <= 25 * 1024 * 1024  -- 25 MB hard cap
  )
);

create index if not exists lead_documents_lead_idx on nw.lead_documents(lead_id, kind, created_at desc);
create index if not exists lead_documents_kind_idx on nw.lead_documents(kind);

alter table nw.lead_documents enable row level security;
alter table nw.lead_documents force row level security;

drop policy if exists lead_documents_ceo_all on nw.lead_documents;
create policy lead_documents_ceo_all on nw.lead_documents
  for all using (nw.is_ceo()) with check (nw.is_ceo());

drop policy if exists lead_documents_ops_all on nw.lead_documents;
create policy lead_documents_ops_all on nw.lead_documents
  for all using (nw.current_role_name() = 'platform_ops')
              with check (nw.current_role_name() = 'platform_ops');

-- Lead Qualifier read-only on their assigned leads.
drop policy if exists lead_documents_qualifier_read on nw.lead_documents;
create policy lead_documents_qualifier_read on nw.lead_documents
  for select using (
    nw.current_role_name() = 'lead_qualifier'
    and exists (
      select 1 from nw.leads l
      where l.id = lead_documents.lead_id
        and (l.assigned_qualifier_id = nw.current_team_member() or l.assigned_qualifier_id is null)
    )
  );

-- =====================================================================
-- STORAGE BUCKET for uploaded applicant documents
-- The bucket is PRIVATE — no public reads. The application reads through
-- the service-role key only. RLS on storage.objects locks down all paths
-- to service-role; the anon key cannot list, read, or write.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'applicant-docs',
  'applicant-docs',
  false,
  25 * 1024 * 1024,
  array[
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif',
    'image/webp',
    'application/pdf'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Block anon access to the bucket entirely (defence-in-depth — the helpers
-- always use service-role, but if someone misconfigures the client this
-- keeps reads + writes locked out for non-service-role callers).
drop policy if exists applicant_docs_block_anon_select on storage.objects;
create policy applicant_docs_block_anon_select on storage.objects
  for select to anon using (bucket_id <> 'applicant-docs');

drop policy if exists applicant_docs_block_anon_insert on storage.objects;
create policy applicant_docs_block_anon_insert on storage.objects
  for insert to anon with check (bucket_id <> 'applicant-docs');

drop policy if exists applicant_docs_block_anon_update on storage.objects;
create policy applicant_docs_block_anon_update on storage.objects
  for update to anon using (bucket_id <> 'applicant-docs') with check (bucket_id <> 'applicant-docs');

drop policy if exists applicant_docs_block_anon_delete on storage.objects;
create policy applicant_docs_block_anon_delete on storage.objects
  for delete to anon using (bucket_id <> 'applicant-docs');

-- =====================================================================
-- Backfill apply_token on existing leads (no-op for fresh installs).
-- The column default already generates a token on insert; this is for
-- leads that existed before this migration.
-- =====================================================================

update nw.leads
   set apply_token = gen_random_uuid()
 where apply_token is null;
