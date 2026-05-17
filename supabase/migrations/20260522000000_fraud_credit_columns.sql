-- Add fraud detection and credit bracket columns to leads table.
-- These columns are used by the CRM lead detail page (CEO/Ops only).

alter table nw.leads
  add column if not exists fraud_risk boolean not null default false,
  add column if not exists fraud_flags jsonb,
  add column if not exists credit_bracket text;

comment on column nw.leads.fraud_risk is 'Whether fraud signals were detected for this lead';
comment on column nw.leads.fraud_flags is 'Array of fraud flag descriptions (JSON array of strings)';
comment on column nw.leads.credit_bracket is 'Equifax soft-pull credit bracket (e.g. poor, fair, good, excellent)';
