// POST /api/crm/leads/:id/sin-reveal — decrypt and return SIN for CEO.
//
// Logs every reveal to sin_audit_log. Only CEO role can access.

import { NextResponse } from "next/server";
import { readSession } from "@/lib/crm/auth/session";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { decryptSin, maskSin } from "@/lib/crm/security/sin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await readSession("crm");
  if (!session || session.subject.kind !== "team" || session.subject.role !== "ceo") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("id, sin_encrypted")
    .eq("id", id)
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
    lead_id: id,
    revealed_by_team_member_id: session.subject.team_member_id,
    revealed_by_buyer_account_id: null,
    ip_address: ip,
    action: "reveal",
  });

  return NextResponse.json({
    ok: true,
    sin: plaintext,
    masked: maskSin(plaintext),
  });
}
