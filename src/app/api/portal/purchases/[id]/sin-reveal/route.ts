// POST /api/portal/purchases/:id/sin-reveal — decrypt SIN for buyer.
//
// Only after data sharing agreement is signed. Logs to sin_audit_log.

import { NextResponse } from "next/server";
import { readSession } from "@/lib/crm/auth/session";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { decryptSin, maskSin } from "@/lib/crm/security/sin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await readSession("portal");
  if (!session || session.subject.kind !== "buyer") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // Verify purchase belongs to this buyer
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, lead_id, buyer_id")
    .eq("id", id)
    .single();

  if (!purchase || purchase.buyer_id !== session.subject.buyer_account_id) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  // Check data sharing agreement
  const { data: buyer } = await supabase
    .from("buyer_accounts")
    .select("id, sin_reveal_agreement_at")
    .eq("id", session.subject.buyer_account_id)
    .single();

  if (!buyer || !buyer.sin_reveal_agreement_at) {
    return NextResponse.json({ ok: false, error: "agreement_required" }, { status: 403 });
  }

  // Get lead SIN
  const { data: lead } = await supabase
    .from("leads")
    .select("id, sin_encrypted")
    .eq("id", purchase.lead_id)
    .single();

  if (!lead || !lead.sin_encrypted) {
    return NextResponse.json({ ok: false, error: "no_sin" }, { status: 404 });
  }

  let plaintext: string;
  try {
    plaintext = decryptSin(lead.sin_encrypted as string);
  } catch (err) {
    console.error("SIN decryption failed", err);
    return NextResponse.json({ ok: false, error: "decryption_failed" }, { status: 500 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? null;

  await supabase.from("sin_audit_log").insert({
    lead_id: purchase.lead_id,
    revealed_by_team_member_id: null,
    revealed_by_buyer_account_id: session.subject.buyer_account_id,
    ip_address: ip,
    action: "reveal",
  });

  return NextResponse.json({
    ok: true,
    sin: plaintext,
    masked: maskSin(plaintext),
  });
}
