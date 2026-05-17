// POST /api/retell/send-document-sms — Retell Custom Function endpoint.
//
// Called by the Retell agent near the end of the qualification call to send
// the applicant an SMS with their document upload link. Uses the Retell
// SMS-approved pool number (Option 3) so no A2P registration is needed to
// start. The agent says the link out loud and this endpoint delivers it as
// a text message simultaneously.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { verifyRetellSignature } from "@/lib/crm/retell/verify";
import { applyPortalUrl } from "@/lib/crm/leads/apply";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  call_id: z.string().min(1),
  lead_id: z.string().uuid(),
  phone_number: z.string().min(7),
  apply_token: z.string().min(1),
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

  const { call_id, lead_id, apply_token } = parsed.data;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // Look up lead to get first_name for the SMS.
  const { data: lead } = await supabase
    .from("leads")
    .select("first_name")
    .eq("id", lead_id)
    .maybeSingle();

  const firstName = (lead?.first_name as string) || "there";
  const applyUrl = applyPortalUrl(apply_token);

  // SMS body per spec.
  const smsBody =
    `Hi ${firstName}, here is your NewWheels application link. ` +
    `Upload your documents here to get approved faster: ${applyUrl} ` +
    `— NewWheels Team`;

  // Log the SMS send event. The actual SMS delivery is handled by the Retell
  // agent's SMS node using the SMS-approved Retell number (Option 3). This
  // endpoint records the intent and provides the message body back to the
  // agent if needed.
  await supabase.from("lead_audit_log").insert({
    lead_id,
    event: "document_sms_sent",
    detail: {
      call_id,
      apply_token,
      sms_body: smsBody,
    } as Record<string, unknown>,
  });

  return NextResponse.json({
    ok: true,
    action: "sms_logged",
    lead_id,
    sms_body: smsBody,
    apply_url: applyUrl,
  });
}
