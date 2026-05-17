-- Add invoice number and card details to purchases.
-- invoice_number is a 6-digit string generated at purchase time.
-- card_brand / card_last4 are captured from Stripe at charge time.

alter table nw.purchases
  add column if not exists invoice_number text,
  add column if not exists card_brand text,
  add column if not exists card_last4 text;

create unique index if not exists purchases_invoice_number_uq
  on nw.purchases(invoice_number) where invoice_number is not null;
