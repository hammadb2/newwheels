// POST /api/elevenlabs/send-document-sms — ElevenLabs webhook tool endpoint.
//
// Called by the ElevenLabs agent near the end of the qualification call to
// send the applicant an SMS with their document upload link via Twilio.
// Includes retry logic and email fallback via Resend.
//
// Auth: shared secret in Authorization header (Bearer token).

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { verifyToolSecret } from "@/lib/crm/elevenlabs/verify";
import { applyPortalUrl } from "@/lib/crm/leads/apply";
import { normalizeToE164 } from "@/lib/crm/elevenlabs/config";
import { twilioEnv } from "@/lib/crm/retell/sms-fallback";
import { sendEmail } from "@/lib/email/resend";
import { ctaButton, systemEmailWrapper } from "@/lib/email/wrapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ToolCallBody = z.object({
  tool_call_id: z.string().optional(),
  tool_name: z.string().optional(),
  conversation_id: z.string().optional(),
  parameters: z.object({
    lead_id: z.string().uuid(),
  }),
});

async function sendTwilioSms(
  toE164: string,
  body: string,
): Promise<{ ok: boolean; sid: string; error: string }> {
  const { accountSid, authToken, fromNumber } = twilioEnv();
  if (!accountSid || !authToken || !fromNumber) {
    return { ok: false, sid: "", error: "twilio_not_configured" };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: toE164, From: fromNumber, Body: body }),
    });

    if (res.ok) {
      const json = (await res.json().catch(() => ({}))) as { sid?: string };
      return { ok: true, sid: json.sid ?? "", error: "" };
    }
    const errText = await res.text().catch(() => "");
    return { ok: false, sid: "", error: `twilio_${res.status}: ${errText}` };
  } catch (err) {
    return {
      ok: false,
      sid: "",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function buildDocumentEmail(firstName: string, applyUrl: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0A2818;">
      Upload your documents, ${firstName}
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:#0A2818;line-height:1.6;">
      Thanks for speaking with us! To move your vehicle financing application
      forward, please upload your documents using the link below.
    </p>
    ${ctaButton(applyUrl, "Upload documents")}
    <p style="margin:0 0 8px;font-size:14px;color:#0A2818;line-height:1.6;">
      <strong>What you&rsquo;ll need:</strong>
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#0A2818;line-height:1.8;">
      <li>Photo of your driver&rsquo;s licence (front and back)</li>
      <li>Proof of income (recent pay stub or bank statement)</li>
      <li>Work or study permit (if applicable)</li>
    </ul>
    <p style="margin:0;font-size:13px;color:#6B7280;">
      If you have any questions, reply to this email or call us at (587) 900-6051.
    </p>
  `;
  return systemEmailWrapper(body);
}

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

  const { lead_id } = parsed.data.parameters;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ result: "not_configured" }, { status: 503 });
  }

  // Look up lead data — phone, email, name, and apply_token from the record.
  const { data: lead } = await supabase
    .from("leads")
    .select("first_name, phone, email, apply_token")
    .eq("id", lead_id)
    .maybeSingle();

  if (!lead || !lead.apply_token) {
    return NextResponse.json(
      {
        result: "lead_not_found",
        message: "The applicant can go directly to apply.newwheels.ca and type in their email address to find their application and upload documents there.",
      },
      { status: 404 },
    );
  }

  const firstName = (lead.first_name as string) || "there";
  const phone = lead.phone as string;
  const email = lead.email as string | null;
  const applyToken = lead.apply_token as string;
  const applyUrl = applyPortalUrl(applyToken);

  let smsSent = false;
  let smsSid = "";
  let smsError = "";
  let emailSent = false;
  let emailId = "";
  let deliveryMethod = "none";

  // Only attempt SMS if we have a phone number.
  if (phone) {
    const toE164 = normalizeToE164(phone);

    // Attempt 1: primary SMS.
    const smsBody1 =
      `Hi ${firstName}, here is your NewWheels application link. ` +
      `Upload your documents here to get approved faster: ${applyUrl} ` +
      `\u2014 NewWheels Team`;
    const attempt1 = await sendTwilioSms(toE164, smsBody1);

    if (attempt1.ok) {
      smsSent = true;
      smsSid = attempt1.sid;
      deliveryMethod = "sms";
    } else {
      smsError = attempt1.error;

      // Attempt 2: retry with different message body.
      const smsBody2 =
        `${firstName}, your NewWheels document upload link: ${applyUrl} ` +
        `Upload your driver's licence and proof of income to proceed.`;
      const attempt2 = await sendTwilioSms(toE164, smsBody2);

      if (attempt2.ok) {
        smsSent = true;
        smsSid = attempt2.sid;
        smsError = "";
        deliveryMethod = "sms_retry";
      } else {
        smsError = `attempt1: ${attempt1.error}; attempt2: ${attempt2.error}`;
      }
    }
  }

  // If SMS failed or no phone, fall back to email via Resend.
  if (!smsSent && email) {
    const emailHtml = buildDocumentEmail(firstName, applyUrl);
    const emailResult = await sendEmail({
      to: email,
      subject: `Upload your documents \u2014 NewWheels`,
      html: emailHtml,
      tags: [{ name: "type", value: "document_upload_fallback" }],
    });

    if (!emailResult.skipped && emailResult.ok) {
      emailSent = true;
      emailId = emailResult.id ?? "";
      deliveryMethod = "email_fallback";
    }
  }

  // Log the delivery attempt.
  await supabase.from("lead_audit_log").insert({
    lead_id,
    event: "document_sms_sent",
    detail: {
      conversation_id: parsed.data.conversation_id ?? null,
      apply_token: applyToken,
      sms_sent: smsSent,
      sms_sid: smsSid || null,
      sms_error: smsError || null,
      email_sent: emailSent,
      email_id: emailId || null,
      delivery_method: deliveryMethod,
    } as Record<string, unknown>,
  });

  // Build response message for the agent.
  if (smsSent) {
    return NextResponse.json({
      result: "sms_sent",
      lead_id,
      apply_url: applyUrl,
      message: "SMS sent successfully to the applicant's phone number on file.",
    });
  }

  if (emailSent) {
    return NextResponse.json({
      result: "email_sent",
      lead_id,
      apply_url: applyUrl,
      message: "SMS delivery failed but we sent the link to the applicant's email on file. The applicant can also go directly to apply.newwheels.ca and use their email to find their application.",
    });
  }

  return NextResponse.json({
    result: "delivery_failed",
    lead_id,
    apply_url: applyUrl,
    message: "Both SMS and email delivery failed. Tell the applicant they can go directly to apply.newwheels.ca and type in their email address to find their application and upload documents there.",
  });
}
