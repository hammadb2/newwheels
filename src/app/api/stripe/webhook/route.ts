// POST /api/stripe/webhook — verifies Stripe-Signature header against
// STRIPE_WEBHOOK_SECRET and records key events.
//
// We intentionally keep webhook handling thin because our purchase flow
// charges synchronously via confirm=true. The webhook is primarily for
// reconciliation, dispute/chargeback updates, and customer.* mirroring.

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifyStripeSig(payload: string, header: string, secret: string): boolean {
  // Header format: "t=<unix>,v1=<sig>,..."
  const parts = header.split(",").map((p) => p.split("=") as [string, string]);
  const t = parts.find((p) => p[0] === "t")?.[1];
  const v1 = parts.find((p) => p[0] === "v1")?.[1];
  if (!t || !v1) return false;
  const signed = `${t}.${payload}`;
  const expected = createHmac("sha256", secret).update(signed).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  const header = req.headers.get("stripe-signature");
  const raw = await req.text();
  if (!header || !verifyStripeSig(raw, header, secret)) {
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 400 });
  }

  let event: { id: string; type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_payload" }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    // Acknowledge to prevent Stripe from retrying forever even in dev/staging.
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as { id: string; last_payment_error?: { message?: string } };
    await supabase
      .from("purchases")
      .update({ status: "failed", failure_reason: pi.last_payment_error?.message ?? "stripe_failed" })
      .eq("stripe_payment_intent_id", pi.id);
  }

  if (event.type === "charge.refunded") {
    const ch = event.data.object as { payment_intent?: string };
    if (ch.payment_intent) {
      await supabase
        .from("purchases")
        .update({ status: "refunded" })
        .eq("stripe_payment_intent_id", ch.payment_intent);
    }
  }

  // Always 200 once verified so Stripe stops retrying.
  return NextResponse.json({ ok: true });
}
