// POST /api/apply/<token>/sin — encrypt and store applicant SIN.
//
// Token-gated. Accepts { sin: "123456789" } in JSON body.
// Normalises, encrypts via AES-256-GCM, stores in sin_encrypted column.

import { NextResponse } from "next/server";
import { findLeadByApplyToken, isProbablyToken } from "@/lib/crm/leads/apply";
import { encryptSin, normaliseSin } from "@/lib/crm/security/sin";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  if (!isProbablyToken(token)) {
    return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 400 });
  }

  const lead = await findLeadByApplyToken(token);
  if (!lead) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (lead.status === "sold" || lead.status === "expired" || lead.expired_at) {
    return NextResponse.json({ ok: false, error: "closed" }, { status: 409 });
  }

  let body: { sin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.sin || typeof body.sin !== "string") {
    return NextResponse.json({ ok: false, error: "missing_sin" }, { status: 400 });
  }

  let normalised: string;
  try {
    normalised = normaliseSin(body.sin);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_sin" }, { status: 400 });
  }

  let encrypted: string;
  try {
    encrypted = encryptSin(normalised);
  } catch (err) {
    console.error("SIN encryption failed", err);
    return NextResponse.json({ ok: false, error: "encryption_failed" }, { status: 500 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const { error } = await supabase
    .from("leads")
    .update({ sin_encrypted: encrypted })
    .eq("id", lead.id);

  if (error) {
    console.error("SIN store failed", error);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
