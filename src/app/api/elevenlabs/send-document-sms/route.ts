// POST /api/elevenlabs/send-document-sms — ElevenLabs webhook tool endpoint.
//
// Called by the ElevenLabs agent near the end of the qualification call to
// send the applicant an SMS with their document upload link via Twilio.
//
// Auth: shared secret in Authorization header (Bearer token).

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { verifyToolSecret } from "@/lib/crm/elevenlabs/verify";
import { applyPortalUrl } from "@/lib/crm/leads/apply";
import { normalizeToE164 } from "@/lib/crm/elevenlabs/config";
import { twilioEnv } from "@/lib/crm/retell/sms-fallback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ToolCallBody = z.object({
  tool_call_id: z.string().optional(),
  tool_name: z.string().optional(),
  conversation_id: z.string().optional(),
  parameters: z.object({
    lead_id: z.string().uuid(),
    call_id: z.string().min(1),
    phone_number: z.string().min(7),
    apply_token: z.string().min(1),
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

  const { lead_id, call_id, phone_number, apply_token } = parsed.data.parameters;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ result: "not_configured" }, { status: 503 });
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("first_name")
    .eq("id", lead_id)
    .maybeSingle();

  const firstName = (lead?.first_name as string) || "there";
  const applyUrl = applyPortalUrl(apply_token);

  const smsBody =
    `Hi ${firstName}, here is your NewWheels application link. ` +
    `Upload your documents here to get approved faster: ${applyUrl} ` +
    `— NewWheels Team`;

  // Send SMS via Twilio.
  const { accountSid, authToken, fromNumber } = twilioEnv();
  let smsSent = false;
  let smsSid = "";

  if (accountSid && authToken && fromNumber) {
    try {
      const toE164 = normalizeToE164(phone_number);
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const res = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: toE164,
          From: fromNumber,
          Body: smsBody,
        }),
      });

      if (res.ok) {
        const resJson = (await res.json().catch(() => ({}))) as { sid?: string };
        smsSent = true;
        smsSid = resJson.sid ?? "";
      } else {
        const errText = await res.text().catch(() => "");
        console.warn("elevenlabs send-document-sms: Twilio error", res.status, errText);
      }
    } catch (err) {
      console.warn("elevenlabs send-document-sms: Twilio exception", err);
    }
  }

  await supabase.from("lead_audit_log").insert({
    lead_id,
    event: "document_sms_sent",
    detail: {
      call_id,
      conversation_id: parsed.data.conversation_id ?? null,
      apply_token,
      sms_body: smsBody,
      sms_sent: smsSent,
      sms_sid: smsSid || null,
    } as Record<string, unknown>,
  });

  return NextResponse.json({
    result: smsSent ? "sms_sent" : "sms_logged",
    lead_id,
    sms_body: smsBody,
    apply_url: applyUrl,
  });
}
