// SMS fallback via Twilio when applicant does not answer the Retell call.
//
// Sends a text message with the apply.newwheels.ca link so the applicant
// can complete their application online. Gracefully no-ops when Twilio
// credentials are not configured.

import { applyPortalUrl } from "@/lib/crm/leads/apply";
import { SITE_NAME } from "@/lib/site";

export function twilioEnv() {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    fromNumber: process.env.TWILIO_PHONE_NUMBER || "",
  };
}

export function isTwilioConfigured(): boolean {
  const { accountSid, authToken, fromNumber } = twilioEnv();
  return Boolean(accountSid) && Boolean(authToken) && Boolean(fromNumber);
}

export type SmsFallbackResult =
  | { skipped: true; reason: string }
  | { skipped: false; ok: true; sid: string }
  | { skipped: false; ok: false; error: string };

export async function sendSmsFallback(opts: {
  toNumber: string;
  applyToken: string;
  firstName: string;
}): Promise<SmsFallbackResult> {
  const { accountSid, authToken, fromNumber } = twilioEnv();
  if (!accountSid || !authToken || !fromNumber) {
    return { skipped: true, reason: "Twilio not configured" };
  }

  const applyUrl = applyPortalUrl(opts.applyToken);
  const body =
    `Hi ${opts.firstName}, this is ${SITE_NAME}. ` +
    `We tried calling you about your vehicle financing application but couldn't reach you. ` +
    `Complete your application here: ${applyUrl}`;

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: opts.toNumber,
        From: fromNumber,
        Body: body,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { skipped: false, ok: false, error: `twilio_${res.status}: ${text}` };
    }

    const json = (await res.json().catch(() => ({}))) as { sid?: string };
    return { skipped: false, ok: true, sid: json.sid ?? "" };
  } catch (err) {
    return {
      skipped: false,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
