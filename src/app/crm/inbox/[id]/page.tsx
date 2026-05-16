// /crm/inbox/:id — single thread view with reply box.

import { notFound } from "next/navigation";
import Link from "next/link";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { ReplyClient } from "@/components/crm/ReplyClient";

export const dynamic = "force-dynamic";

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { subject } = await requireTeam("any_team");
  if (subject.kind !== "team") return null;

  const supabase = getServerSupabase();
  if (!supabase) return notFound();

  const { data: thread } = await supabase
    .from("email_threads")
    .select("id, subject, owner_email, lead_id")
    .eq("id", id)
    .single();
  if (!thread) return notFound();

  const { data: me } = await supabase
    .from("team_members")
    .select("email")
    .eq("id", subject.team_member_id)
    .single();
  const myEmail = (me?.email as string) ?? "";
  if (subject.role !== "ceo" && thread.owner_email !== myEmail) {
    return <p className="text-sm text-red-700">You don&apos;t have access to that mailbox.</p>;
  }

  const { data: messages } = await supabase
    .from("email_messages")
    .select("id, direction, from_email, to_emails, subject, body_text, created_at")
    .eq("thread_id", id)
    .order("created_at", { ascending: true });

  // Mark this thread read for the viewing user.
  await supabase
    .from("email_threads")
    .update({ unread_count: 0 })
    .eq("id", id)
    .eq("owner_email", thread.owner_email);

  return (
    <div className="space-y-4">
      <Link href="/crm/inbox" className="text-sm text-[#0A2818] underline">← Back to inbox</Link>

      <div>
        <h1 className="text-2xl font-extrabold text-[#0A2818]">{thread.subject as string}</h1>
        <p className="text-xs text-[#6B7280] mt-1">Mailbox: {thread.owner_email as string}</p>
        {thread.lead_id ? (
          <Link href={`/crm/leads/${thread.lead_id}`} className="text-xs text-[#0A2818] underline">↳ Linked lead</Link>
        ) : null}
      </div>

      <div className="space-y-3">
        {(messages ?? []).map((m) => (
          <article key={m.id as string} className="crm-card">
            <header className="flex justify-between items-center mb-2">
              <div className="text-sm">
                <strong className="text-[#0A2818]">{m.from_email as string}</strong>
                <span className="text-[#6B7280]"> → {(m.to_emails as string[]).join(", ")}</span>
              </div>
              <time className="text-xs text-[#6B7280]">{new Date(m.created_at as string).toLocaleString("en-CA")}</time>
            </header>
            <p className="text-sm text-[#0A2818] whitespace-pre-wrap">{m.body_text as string}</p>
            <p className="text-xs text-[#6B7280] mt-2">{(m.direction as string) === "inbound" ? "Received" : "Sent"}</p>
          </article>
        ))}
      </div>

      <ReplyClient threadId={id} ownerEmail={thread.owner_email as string} subject={thread.subject as string} leadId={thread.lead_id as string | null} />
    </div>
  );
}
