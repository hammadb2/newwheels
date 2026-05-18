// POST /api/elevenlabs/mark-uncontactable — ElevenLabs webhook tool endpoint.
//
// Called by the ElevenLabs agent when the applicant does not answer or hangs
// up immediately. Sets the lead status to uncontactable in the CRM.
//
// Auth: shared secret in Authorization header (Bearer token).

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { verifyToolSecret } from "@/lib/crm/elevenlabs/verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ToolCallBody = z.object({
  tool_call_id: z.string().optional(),
  tool_name: z.string().optional(),
  conversation_id: z.string().optional(),
  parameters: z.object({
    lead_id: z.string().uuid(),
    call_id: z.string().min(1).optional(),
    reason: z.string().min(1).max(200),
  }),
});

export async function POST(req: Request) {
  if (!verifyToolSecret(req)) {
    return NextResponse.json({ result: "invalid_secret" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ result: "invalid_json" }, { status: 400 });
  }

  const parsed = ToolCallBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { result: "invalid_input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { lead_id, call_id, reason } = parsed.data.parameters;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ result: "not_configured" }, { status: 503 });
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
      conversation_id: parsed.data.conversation_id ?? null,
      reason,
      source: "elevenlabs_agent",
    } as Record<string, unknown>,
  });

  return NextResponse.json({
    result: "marked_uncontactable",
    lead_id,
  });
}
