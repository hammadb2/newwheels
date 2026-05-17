// POST /api/retell/mark-uncontactable — Retell Custom Function endpoint.
//
// Called by the Retell agent when the applicant does not answer or hangs up
// immediately. Sets the lead status to uncontactable in the CRM.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { verifyRetellSignature } from "@/lib/crm/retell/verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  call_id: z.string().min(1),
  lead_id: z.string().uuid(),
  reason: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  const rawBody = await req.text();

  const signature = req.headers.get("x-retell-signature");
  if (!(await verifyRetellSignature(rawBody, signature))) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { call_id, lead_id, reason } = parsed.data;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  await supabase
    .from("leads")
    .update({
      retell_call_status: "no_answer",
      status: "qualifying",
      follow_up_needed: true,
    })
    .eq("id", lead_id);

  await supabase.from("lead_audit_log").insert({
    lead_id,
    event: "marked_uncontactable",
    detail: {
      call_id,
      reason,
      source: "retell_agent",
    } as Record<string, unknown>,
  });

  return NextResponse.json({
    ok: true,
    action: "marked_uncontactable",
    lead_id,
  });
}
