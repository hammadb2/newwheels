// POST /api/crm/email/send — team member sends an email from their mailbox.

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { systemEmailWrapper } from "@/lib/email/wrapper";
import { appendMessageToThread, findOrCreateThread } from "@/lib/email/threading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  thread_id: z.string().uuid().optional(),
  from_email: z.string().email(),
  to_email: z.string().email(),
  subject: z.string().min(1).max(200),
  body_text: z.string().min(1).max(20000),
  lead_id: z.string().uuid().nullable().optional(),
});

export async function POST(req: Request) {
  const { subject } = await requireTeam("any_team");
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  // Confirm the team member owns from_email.
  const { data: me } = await supabase
    .from("team_members")
    .select("id, email")
    .eq("id", subject.team_member_id)
    .single();
  if (!me) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const myEmail = (me.email as string).toLowerCase();
  const fromEmail = parsed.data.from_email.toLowerCase();
  if (subject.role !== "ceo" && fromEmail !== myEmail) {
    return NextResponse.json({ ok: false, error: "wrong_mailbox" }, { status: 403 });
  }

  const threadId = parsed.data.thread_id ?? (await findOrCreateThread({
    owner_email: fromEmail,
    counterparty_email: parsed.data.to_email,
    subject: parsed.data.subject,
  }, parsed.data.lead_id ?? null));
  if (!threadId) return NextResponse.json({ ok: false, error: "thread_failed" }, { status: 500 });

  const resp = await sendEmail({
    from: fromEmail,
    to: parsed.data.to_email,
    subject: parsed.data.subject,
    html: systemEmailWrapper(parsed.data.body_text.replace(/\n/g, "<br>")),
    text: parsed.data.body_text,
    tags: [{ name: "type", value: "team_outbound" }],
  });

  await appendMessageToThread({
    thread_id: threadId,
    direction: "outbound",
    from_email: fromEmail,
    to_emails: [parsed.data.to_email],
    subject: parsed.data.subject,
    body_text: parsed.data.body_text,
    body_html: null,
    external_message_id: "ok" in resp && resp.ok ? (resp.id ?? null) : null,
    lead_id: parsed.data.lead_id ?? null,
  });

  return NextResponse.json({ ok: true, thread_id: threadId });
}
