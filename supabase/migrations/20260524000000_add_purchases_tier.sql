-- Add tier column to purchases table.
--
-- The purchase API route and both portal pages (purchases list + detail)
-- already reference purchases.tier, but the column was never created.
-- This caused INSERT failures ("db_error") after the Stripe charge
-- succeeded, leaving charged-but-unrecorded purchases.

alter table nw.purchases
  add column if not exists tier nw.lead_tier;

-- Backfill any existing purchases from the associated lead.
update nw.purchases p
   set tier = l.tier
  from nw.leads l
 where l.id = p.lead_id
   and p.tier is null;
