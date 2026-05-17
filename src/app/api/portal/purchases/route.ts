// POST /api/portal/purchases
// Body: { lead_id: string }
//
// Atomically: re-load the lead, re-compute current price, charge the buyer
// via Stripe at that price, mark the lead sold, insert the purchase row,
// send the full-details email.
//
// Race conditions are handled by trying a conditional UPDATE first (status =
// available → sold). Whoever wins the UPDATE owns the lead. The loser sees
// already_sold and gets a clean error.

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { currentPriceFor, priceCentsToDisplay } from "@/lib/crm/pricing";
import { createPaymentIntent, isStripeConfigured } from "@/lib/payments/stripe";
import { sendEmail } from "@/lib/email/resend";
import { purchaseConfirmationEmail } from "@/lib/email/templates";
import type { LeadTier } from "@/lib/crm/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ lead_id: z.string().uuid() });

export async function POST(req: Request) {
  const { subject } = await requireBuyer();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: buyer } = await supabase
    .from("buyer_accounts")
    .select("id, status, stripe_customer_id, default_payment_method_id, contact_name, business_name, email")
    .eq("id", subject.buyer_account_id)
    .single();
  if (!buyer || buyer.status !== "active") {
    return NextResponse.json({ ok: false, error: "buyer_not_active" }, { status: 403 });
  }
  if (!buyer.stripe_customer_id || !buyer.default_payment_method_id) {
    return NextResponse.json({ ok: false, error: "no_payment_method" }, { status: 402 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: "stripe_not_configured" }, { status: 503 });
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("id, tier, available_at, status, current_price_cents, price_override_cents, first_name, last_name, email, phone, raw_payload")
    .eq("id", parsed.data.lead_id)
    .single();
  if (!lead) return NextResponse.json({ ok: false, error: "lead_not_found" }, { status: 404 });
  if (lead.status !== "available") {
    return NextResponse.json({ ok: false, error: "lead_unavailable" }, { status: 409 });
  }

  const tier = (lead.tier as LeadTier) ?? "standard";
  const overrideCents = lead.price_override_cents as number | null;
  const price = currentPriceFor({ tier, available_at: new Date(lead.available_at as string), now: new Date() });
  if (price.expired && overrideCents == null) {
    return NextResponse.json({ ok: false, error: "lead_expired" }, { status: 410 });
  }
  const effectivePrice = overrideCents ?? price.price_cents;

  // Lock the lead optimistically. If another buyer beats us, the UPDATE
  // affects 0 rows.
  const { data: claimed, error: claimErr } = await supabase
    .from("leads")
    .update({
      status: "sold",
      sold_at: new Date().toISOString(),
      current_price_cents: effectivePrice,
    })
    .eq("id", lead.id)
    .eq("status", "available")
    .select("id")
    .maybeSingle();
  if (claimErr) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  if (!claimed) return NextResponse.json({ ok: false, error: "already_sold" }, { status: 409 });

  // Charge.
  let payment_intent_id: string | null = null;
  try {
    const pi = await createPaymentIntent({
      amount_cents: effectivePrice,
      customer: buyer.stripe_customer_id as string,
      payment_method: buyer.default_payment_method_id as string,
      off_session: true,
      confirm: true,
      description: `NewWheels lead — ${lead.first_name}`,
      metadata: { lead_id: lead.id as string, buyer_id: buyer.id as string },
    });
    if (pi.status !== "succeeded") {
      throw new Error(`status_${pi.status}`);
    }
    payment_intent_id = pi.id;
  } catch (e) {
    console.warn("Stripe charge failed; releasing lead", e);
    await supabase.from("leads").update({ status: "available", sold_at: null }).eq("id", lead.id);
    const msg = e instanceof Error ? e.message : "stripe_error";
    return NextResponse.json({ ok: false, error: "payment_failed", detail: msg }, { status: 402 });
  }

  const { data: purchase, error: pErr } = await supabase
    .from("purchases")
    .insert({
      lead_id: lead.id,
      buyer_id: buyer.id,
      sub_account_id: null,
      amount_cents: effectivePrice,
      tier,
      status: "paid",
      stripe_payment_intent_id: payment_intent_id,
      purchased_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (pErr || !purchase) {
    console.error("purchases insert failed", pErr);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  await supabase.from("lead_audit_log").insert({
    lead_id: lead.id,
    actor_buyer_id: buyer.id,
    event: "sold",
    detail: { amount_cents: effectivePrice, tier, purchase_id: purchase.id } as Record<string, unknown>,
  });

  const portalUrl = (process.env.NW_PORTAL_URL || "https://portal.newwheels.ca").replace(/\/$/, "");
  const buyerName = (buyer.business_name as string) || (buyer.contact_name as string) || "there";
  void sendEmail({
    to: buyer.email as string,
    subject: `Your NewWheels lead — ${lead.first_name}`,
    html: purchaseConfirmationEmail({
      buyerName,
      amount: priceCentsToDisplay(effectivePrice),
      lead: {
        fullName: `${lead.first_name as string} ${lead.last_name as string}`.trim(),
        phone: lead.phone as string,
        email: lead.email as string,
        summary: (((lead.raw_payload as Record<string, unknown> | null) ?? {}).situation_summary as string) ?? "",
      },
      dashboardUrl: `${portalUrl}/portal/purchases/${purchase.id}`,
    }),
    tags: [{ name: "type", value: "purchase_confirmation" }],
  });

  return NextResponse.json({ ok: true, purchase_id: purchase.id });
}
