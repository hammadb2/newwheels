// /crm/outreach — daily outreach log for Community Outreach Specialist.
//
// Spec calls for a daily activity log: groups posted in, DMs sent,
// conversations started, form submissions attributed. We model each entry
// as a row in nw.outreach_logs (one per day per team member). The form
// below upserts today's entry.

import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { OutreachLogClient } from "@/components/crm/OutreachLogClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Outreach log — NewWheels CRM" };

type LogRow = {
  log_date: string;
  groups_posted_in: number;
  dms_sent: number;
  conversations_started: number;
  form_submissions_attributed: number;
  notes: string | null;
};

export default async function OutreachLogPage() {
  const { subject } = await requireTeam("community_outreach");
  const supabase = getServerSupabase();
  const today = new Date().toISOString().slice(0, 10);

  let todayRow: LogRow | null = null;
  let history: LogRow[] = [];
  if (supabase) {
    const { data: t } = await supabase
      .from("outreach_logs")
      .select("log_date, groups_posted_in, dms_sent, conversations_started, form_submissions_attributed, notes")
      .eq("team_member_id", subject.team_member_id)
      .eq("log_date", today)
      .maybeSingle();
    todayRow = (t ?? null) as LogRow | null;

    const { data: h } = await supabase
      .from("outreach_logs")
      .select("log_date, groups_posted_in, dms_sent, conversations_started, form_submissions_attributed, notes")
      .eq("team_member_id", subject.team_member_id)
      .order("log_date", { ascending: false })
      .limit(14);
    history = (h ?? []) as LogRow[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Daily outreach log</h1>
        <p className="text-sm text-[#6B7280] mt-1">Log today&apos;s activity. HR uses this to calculate pay.</p>
      </div>

      <OutreachLogClient today={today} initial={todayRow} />

      <section>
        <h2 className="text-lg font-extrabold text-[#0A2818] mb-2">Last 14 days</h2>
        {history.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F7F4] text-left text-xs uppercase tracking-wider text-[#6B7280]">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Groups</th>
                  <th className="px-3 py-2">DMs</th>
                  <th className="px-3 py-2">Conversations</th>
                  <th className="px-3 py-2">Form submissions</th>
                  <th className="px-3 py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.log_date} className="border-t border-[#E5E7EB]">
                    <td className="px-3 py-2 font-semibold text-[#0A2818]">{r.log_date}</td>
                    <td className="px-3 py-2">{r.groups_posted_in}</td>
                    <td className="px-3 py-2">{r.dms_sent}</td>
                    <td className="px-3 py-2">{r.conversations_started}</td>
                    <td className="px-3 py-2">{r.form_submissions_attributed}</td>
                    <td className="px-3 py-2 text-[#6B7280]">{r.notes ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
