// /crm/hr — Team performance dashboard for HR.
//
// HR sees per-member productivity for payroll. No revenue, no buyer data,
// no lead content. Pulls from nw.lead_qualifications + nw.lead_audit_log
// and nw.outreach_logs / nw.content_tasks.

import { requireTeam } from "@/lib/crm/auth/rbac";
import { loadTeamPerformanceReport, defaultThisWeek } from "@/lib/crm/reports/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team performance — NewWheels CRM" };

export default async function HrDashboardPage() {
  await requireTeam("hr");
  const range = defaultThisWeek();
  const report = await loadTeamPerformanceReport(range);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Team performance</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {new Date(range.start).toLocaleDateString("en-CA")} → {new Date(range.end).toLocaleDateString("en-CA")}
        </p>
      </div>

      {report.members.length === 0 ? (
        <p className="text-sm text-[#6B7280]">No team activity in this period.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F7F4] text-left text-xs uppercase tracking-wider text-[#6B7280]">
              <tr>
                <th className="px-3 py-2">Member</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2 text-right">Qualified</th>
                <th className="px-3 py-2 text-right">Unqualified</th>
                <th className="px-3 py-2 text-right">Sold thru</th>
                <th className="px-3 py-2 text-right">Expired thru</th>
                <th className="px-3 py-2 text-right">Avg qual time (min)</th>
                <th className="px-3 py-2 text-right">Avg score</th>
              </tr>
            </thead>
            <tbody>
              {report.members.map((m) => (
                <tr key={m.id} className="border-t border-[#E5E7EB]">
                  <td className="px-3 py-2 font-semibold text-[#0A2818]">{m.name}</td>
                  <td className="px-3 py-2 text-[#6B7280]">{m.role.replace(/_/g, " ")}</td>
                  <td className="px-3 py-2 text-right">{m.qualified}</td>
                  <td className="px-3 py-2 text-right">{m.unqualified}</td>
                  <td className="px-3 py-2 text-right">{m.sold_through}</td>
                  <td className="px-3 py-2 text-right">{m.expired_through}</td>
                  <td className="px-3 py-2 text-right">{m.avg_qual_minutes ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{m.avg_score ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
