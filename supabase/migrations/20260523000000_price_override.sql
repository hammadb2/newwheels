-- Allow CEO to manually override the computed price on a lead.
-- When price_override_cents is NOT NULL the pricing cron skips the lead
-- and current_price_cents stays at the overridden value.

alter table nw.leads
  add column if not exists price_override_cents integer,
  add column if not exists price_override_by uuid references nw.team_members(id),
  add column if not exists price_override_at timestamptz;

comment on column nw.leads.price_override_cents is 'CEO-set manual price in cents; NULL means use computed pricing curve';
comment on column nw.leads.price_override_by is 'team_member who set the override';
comment on column nw.leads.price_override_at is 'when the override was set';
