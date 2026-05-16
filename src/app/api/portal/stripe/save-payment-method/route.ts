// POST /api/portal/stripe/save-payment-method
// Body: { payment_method_id: string }
//
// Records the buyer's default payment method server-side after the Stripe.js
// front-end has collected a card via the setup intent.

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ payment_method_id: z.string().min(8).max(80) });

export async function POST(req: Request) {
  const { subject } = await requireBuyer();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { error } = await supabase
    .from("buyer_accounts")
    .update({ default_payment_method_id: parsed.data.payment_method_id })
    .eq("id", subject.buyer_account_id);
  if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
