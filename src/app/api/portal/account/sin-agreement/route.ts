// POST /api/portal/account/sin-agreement — sign data sharing agreement.
//
// Records the buyer's agreement to use SIN solely for credit inquiry
// in compliance with PIPEDA.

import { NextResponse } from "next/server";
import { readSession } from "@/lib/crm/auth/session";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await readSession("portal");
  if (!session || session.subject.kind !== "buyer") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // Get buyer to check kind
  const { data: buyer } = await supabase
    .from("buyer_accounts")
    .select("id, kind")
    .eq("id", session.subject.buyer_account_id)
    .single();

  if (!buyer || buyer.kind !== "dealer_master") {
    return NextResponse.json({ ok: false, error: "dealer_master_only" }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? null;

  const { error } = await supabase
    .from("buyer_accounts")
    .update({
      sin_reveal_agreement_at: new Date().toISOString(),
      sin_reveal_agreement_signed_by: ip ?? "unknown",
    })
    .eq("id", session.subject.buyer_account_id);

  if (error) {
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
