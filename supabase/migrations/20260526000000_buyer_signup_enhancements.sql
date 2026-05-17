-- Buyer signup enhancements — add first/last name and dealership fields.
--
-- Individual buyers now provide first + last name (instead of a single
-- contact_name), the dealership they work at, its address, and the
-- dealership phone number. These columns are nullable so existing rows
-- and dealer_master signups (which don't collect them) remain valid.
--
-- Strictly additive: only new columns. No destructive operations.

alter table nw.buyer_accounts
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists dealership_name text,
  add column if not exists dealership_address text,
  add column if not exists dealership_phone text;
