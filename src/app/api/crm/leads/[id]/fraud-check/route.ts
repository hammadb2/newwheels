// POST /api/crm/leads/:id/fraud-check — run fraud checks on a lead.
//
// Called during lead intake or manually by qualifier. Updates fraud_risk
// and fraud_flags on the lead record.

import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { runFraudChecks } from "@/lib/crm/fraud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("id, email, phone, device_fingerprint")
    .eq("id", id)
    .single();

  if (!lead) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const result = await runFraudChecks({
    email: (lead.email as string) ?? "",
    phone: (lead.phone as string) ?? "",
    device_fingerprint: (lead.device_fingerprint as string) ?? undefined,
  });

  await supabase
    .from("leads")
    .update({
      fraud_risk: result.fraud_risk,
      fraud_flags: result.flags,
    })
    .eq("id", id);

  return NextResponse.json({ ok: true, ...result });
}
