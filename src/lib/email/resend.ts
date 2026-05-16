// Thin wrapper around the Resend REST API. We keep this file deliberately
// dependency-free (just `fetch`) to match the pattern used in
// src/app/api/lead/route.ts.
//
// Every send returns a structured result so callers can decide whether to
// surface failures, no-op (when RESEND_API_KEY isn't set), or log + retry.

export type ResendSendResult =
  | { skipped: true; reason: string }
  | { skipped: false; ok: true; id?: string }
  | { skipped: false; ok: false; status?: number; error: string };

export const SYSTEM_FROM = process.env.NW_SYSTEM_FROM || "NewWheels <noreply@newwheels.ca>";
export const TEAM_DOMAIN = process.env.NW_TEAM_DOMAIN || "team.newwheels.ca";

export async function sendEmail(opts: {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
  reply_to?: string;
  cc?: string | string[];
  bcc?: string | string[];
  tags?: { name: string; value: string }[];
  headers?: Record<string, string>;
}): Promise<ResendSendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { skipped: true, reason: "RESEND_API_KEY not set" };

  const body: Record<string, unknown> = {
    from: opts.from || SYSTEM_FROM,
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html: opts.html,
  };
  if (opts.text) body.text = opts.text;
  if (opts.reply_to) body.reply_to = opts.reply_to;
  if (opts.cc) body.cc = Array.isArray(opts.cc) ? opts.cc : [opts.cc];
  if (opts.bcc) body.bcc = Array.isArray(opts.bcc) ? opts.bcc : [opts.bcc];
  if (opts.tags) body.tags = opts.tags;
  if (opts.headers) body.headers = opts.headers;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { skipped: false, ok: false, status: res.status, error: text };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    return { skipped: false, ok: true, id: json.id };
  } catch (err) {
    return {
      skipped: false,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function teamEmailAddress(localPart: string): string {
  return `${localPart}@${TEAM_DOMAIN}`;
}
