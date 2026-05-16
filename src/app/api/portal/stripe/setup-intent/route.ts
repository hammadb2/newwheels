// POST /api/portal/stripe/setup-intent
//
// Creates (or reuses) a Stripe customer for the buyer and returns a setup
// intent client_secret so the front-end can collect the card via Stripe.js.

import { NextResponse } from "next/server";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { createCustomer, createSetupIntent, isStripeConfigured } from "@/lib/payments/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: "stripe_not_configured" }, { status: 503 });
  }
  const { subject } = await requireBuyer();
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: buyer } = await supabase
    .from("buyer_accounts")
    .select("id, email, business_name, contact_name, stripe_customer_id")
    .eq("id", subject.buyer_account_id)
    .single();
  if (!buyer) return NextResponse.json({ ok: false, error: "buyer_not_found" }, { status: 404 });

  let customerId = buyer.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await createCustomer({
      email: buyer.email as string,
      name: ((buyer.business_name as string) || (buyer.contact_name as string)) ?? undefined,
      metadata: { buyer_id: buyer.id as string },
    });
    customerId = customer.id;
    await supabase.from("buyer_accounts").update({ stripe_customer_id: customerId }).eq("id", buyer.id);
  }

  const intent = await createSetupIntent({ customer: customerId });
  return NextResponse.json({ ok: true, client_secret: intent.client_secret, customer_id: customerId });
}
