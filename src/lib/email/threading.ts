// Helpers for threading outbound + inbound emails inside the CRM.
//
// We thread by (owner_email, normalized_subject, counterparty_email). The
// owner_email is "the team mailbox this thread belongs to" — i.e. the team
// member who owns the conversation. The counterparty is whoever they're
// talking to (a lead, an external party, etc).

import { getServerSupabase } from "@/lib/crm/supabase/server";

export function normalizeSubject(raw: string): string {
  return (raw || "(no subject)")
    .replace(/^\s*(re|fwd|fw)\s*:\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

export type ThreadKey = {
  owner_email: string;
  counterparty_email: string;
  subject: string;
};

export async function findOrCreateThread(key: ThreadKey, leadId: string | null = null): Promise<string | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const normalized = normalizeSubject(key.subject);
  const owner = key.owner_email.toLowerCase();
  const counterparty = key.counterparty_email.toLowerCase();

  const { data: existing } = await supabase
    .from("email_threads")
    .select("id")
    .eq("owner_email", owner)
    .eq("counterparty_email", counterparty)
    .eq("normalized_subject", normalized)
    .maybeSingle();
  if (existing) return existing.id as string;

  const { data: inserted, error } = await supabase
    .from("email_threads")
    .insert({
      owner_email: owner,
      counterparty_email: counterparty,
      normalized_subject: normalized,
      subject: key.subject.slice(0, 200),
      last_at: new Date().toISOString(),
      last_preview: "",
      last_from: owner,
      message_count: 0,
      unread_count: 0,
      lead_id: leadId,
    })
    .select("id")
    .single();
  if (error || !inserted) return null;
  return inserted.id as string;
}

export async function appendMessageToThread(opts: {
  thread_id: string;
  direction: "inbound" | "outbound";
  from_email: string;
  to_emails: string[];
  cc_emails?: string[];
  subject: string;
  body_text: string;
  body_html?: string | null;
  external_message_id?: string | null;
  in_reply_to?: string | null;
  lead_id?: string | null;
}): Promise<string | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data: msg, error } = await supabase
    .from("email_messages")
    .insert({
      thread_id: opts.thread_id,
      direction: opts.direction,
      from_email: opts.from_email.toLowerCase(),
      to_emails: opts.to_emails.map((e) => e.toLowerCase()),
      cc_emails: (opts.cc_emails ?? []).map((e) => e.toLowerCase()),
      subject: opts.subject.slice(0, 200),
      body_text: opts.body_text,
      body_html: opts.body_html ?? null,
      external_message_id: opts.external_message_id ?? null,
      in_reply_to: opts.in_reply_to ?? null,
      lead_id: opts.lead_id ?? null,
    })
    .select("id")
    .single();
  if (error || !msg) return null;

  // Refresh thread summary.
  const preview = opts.body_text.replace(/\s+/g, " ").trim().slice(0, 180);
  await supabase
    .from("email_threads")
    .update({
      last_at: new Date().toISOString(),
      last_preview: preview,
      last_from: opts.from_email.toLowerCase(),
      message_count: (
        await supabase.from("email_messages").select("id", { count: "exact", head: true }).eq("thread_id", opts.thread_id)
      ).count ?? 0,
      unread_count: opts.direction === "inbound"
        ? ((
            await supabase.from("email_threads").select("unread_count").eq("id", opts.thread_id).single()
          ).data?.unread_count ?? 0) + 1
        : 0,
      lead_id: opts.lead_id ?? null,
    })
    .eq("id", opts.thread_id);

  return msg.id as string;
}
