// POST /api/email/inbound — Resend inbound webhook.
//
// Resend's inbound webhook posts a JSON body when an email is received on a
// domain configured with the right MX records. We expect:
// {
//   "type": "email.inbound",
//   "data": {
//     "from": "lead@example.com",
//     "to": ["qualifier1@team.newwheels.ca"],
//     "subject": "Re: Your application",
//     "text": "...",
//     "html": "...",
//     "messageId": "<...>",
//     "inReplyTo": "<...>"
//   }
// }
//
// We verify the webhook with Svix signing if `RESEND_WEBHOOK_SECRET` is set
// (Resend recommends Svix). If it's not set we accept any request — that is
// only acceptable in dev; production deployments MUST set the secret.

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { appendMessageToThread, findOrCreateThread, normalizeSubject } from "@/lib/email/threading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ResendInbound = {
  type?: string;
  data?: {
    from?: string;
    to?: string[];
    cc?: string[];
    subject?: string;
    text?: string;
    html?: string;
    messageId?: string;
    inReplyTo?: string;
  };
};

function verifySvix(req: Request, payload: string, secret: string): boolean {
  const id = req.headers.get("svix-id");
  const timestamp = req.headers.get("svix-timestamp");
  const signature = req.headers.get("svix-signature");
  if (!id || !timestamp || !signature) return false;
  const secretBytes = secret.startsWith("whsec_") ? Buffer.from(secret.slice(6), "base64") : Buffer.from(secret);
  const signed = `${id}.${timestamp}.${payload}`;
  const expected = createHmac("sha256", secretBytes).update(signed).digest("base64");
  for (const part of signature.split(" ")) {
    const sig = part.split(",")[1];
    if (!sig) continue;
    try {
      if (timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return true;
    } catch {
      continue;
    }
  }
  return false;
}

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (secret && !verifySvix(req, raw, secret)) {
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 400 });
  }

  let payload: ResendInbound;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_payload" }, { status: 400 });
  }

  if (!payload?.data || payload.type !== "email.inbound") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const data = payload.data;
  const from = (data.from ?? "").toLowerCase().trim();
  const toList = (data.to ?? []).map((e) => e.toLowerCase().trim()).filter(Boolean);
  if (!from || toList.length === 0) {
    return NextResponse.json({ ok: false, error: "missing_addresses" }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: true, skipped: true });

  // Match each `to` against a team mailbox we know about.
  const { data: members } = await supabase
    .from("team_members")
    .select("email")
    .in("email", toList)
    .eq("active", true);
  const ownerEmails = (members ?? []).map((m) => (m.email as string).toLowerCase());

  if (ownerEmails.length === 0) {
    // Email landed at an unknown mailbox; ignore but log.
    console.warn("inbound email for unknown mailbox", toList);
    return NextResponse.json({ ok: true, skipped: true });
  }

  const subject = normalizeSubject(data.subject ?? "");
  const body_text = (data.text ?? "").slice(0, 100000);
  const body_html = data.html ?? null;
  const externalId = data.messageId ?? null;
  const inReplyTo = data.inReplyTo ?? null;

  // Try to associate with an existing lead by counterparty email.
  let leadId: string | null = null;
  {
    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("email", from)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    leadId = (lead?.id as string) ?? null;
  }

  for (const owner of ownerEmails) {
    const threadId = await findOrCreateThread({
      owner_email: owner,
      counterparty_email: from,
      subject,
    }, leadId);
    if (!threadId) continue;
    await appendMessageToThread({
      thread_id: threadId,
      direction: "inbound",
      from_email: from,
      to_emails: toList,
      cc_emails: data.cc ?? [],
      subject,
      body_text,
      body_html,
      external_message_id: externalId,
      in_reply_to: inReplyTo,
      lead_id: leadId,
    });
  }

  return NextResponse.json({ ok: true });
}
