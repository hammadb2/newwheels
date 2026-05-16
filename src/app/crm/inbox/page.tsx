// /crm/inbox — internal team email inbox.
//
// Each team member sees emails sent to or from their address. CEO additionally
// sees a "Team" tab spanning every team inbox.

import Link from "next/link";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inbox — NewWheels CRM" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function InboxPage({ searchParams }: { searchParams: SearchParams }) {
  const { subject } = await requireTeam("any_team");
  if (subject.kind !== "team") return null;
  const params = await searchParams;
  const tab = params.tab === "team" && subject.role === "ceo" ? "team" : "mine";

  const supabase = getServerSupabase();
  if (!supabase) return <p className="text-sm text-[#6B7280]">Database not configured.</p>;

  // Pull the team member's email address so we can scope threads.
  const { data: me } = await supabase
    .from("team_members")
    .select("email")
    .eq("id", subject.team_member_id)
    .single();
  const myEmail = (me?.email as string) ?? "";

  // Threads: pick most recent message per thread, scoped to my email
  // (or all team emails when CEO viewing team).
  let query = supabase
    .from("email_threads")
    .select("id, subject, last_at, last_preview, last_from, message_count, unread_count, owner_email")
    .order("last_at", { ascending: false })
    .limit(200);
  if (tab === "mine") {
    query = query.eq("owner_email", myEmail);
  }
  const { data: threads } = await query;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Inbox</h1>
        <div className="flex gap-2">
          {subject.role === "ceo" && (
            <Link href="/crm/inbox?tab=mine" className={`crm-btn ${tab === "mine" ? "" : "crm-btn-secondary"}`}>My inbox</Link>
          )}
          {subject.role === "ceo" && (
            <Link href="/crm/inbox?tab=team" className={`crm-btn ${tab === "team" ? "" : "crm-btn-secondary"}`}>Team</Link>
          )}
          <Link href="/crm/inbox/compose" className="crm-btn">Compose</Link>
        </div>
      </div>
      <p className="text-sm text-[#6B7280]">Signed in as <strong>{myEmail || "you"}</strong></p>

      <div className="crm-card p-0 overflow-x-auto">
        <table className="crm-table">
          <thead><tr><th>From</th><th>Subject</th><th>Preview</th><th>Mailbox</th><th>Last</th></tr></thead>
          <tbody>
            {(threads ?? []).length === 0 ? (
              <tr><td colSpan={5} className="text-sm text-[#6B7280] py-8 text-center">No messages yet.</td></tr>
            ) : (
              (threads ?? []).map((t) => (
                <tr key={t.id as string} className={Number(t.unread_count) > 0 ? "font-extrabold" : ""}>
                  <td>{t.last_from as string}</td>
                  <td><Link href={`/crm/inbox/${t.id}`} className="text-[#0A2818] underline">{t.subject as string}</Link></td>
                  <td className="text-sm text-[#6B7280] max-w-[420px] truncate">{t.last_preview as string}</td>
                  <td className="text-xs">{t.owner_email as string}</td>
                  <td className="text-xs text-[#6B7280]">{new Date(t.last_at as string).toLocaleString("en-CA")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
