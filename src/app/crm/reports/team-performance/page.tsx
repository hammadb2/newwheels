// /crm/reports/team-performance — CEO/HR per-team-member productivity.

import Link from "next/link";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { defaultThisWeek, loadTeamPerformanceReport } from "@/lib/crm/reports/queries";
import { ROLE_LABEL } from "@/lib/crm/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team performance — NewWheels CRM" };

export default async function TeamReportPage() {
  // CEO + HR both can access this.
  await requireTeam("hr");
  const range = defaultThisWeek();
  const r = await loadTeamPerformanceReport(range);
  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Team performance</h1>
        <Link href="/api/crm/reports/team-performance.csv" className="crm-btn crm-btn-secondary">Download CSV</Link>
      </div>
      <p className="text-xs text-[#6B7280]">Period: {range.start.toLocaleDateString("en-CA")} → {range.end.toLocaleDateString("en-CA")}</p>

      <div className="crm-card p-0 overflow-x-auto">
        <table className="crm-table">
          <thead><tr><th>Name</th><th>Role</th><th>Qualified</th><th>Unqualified</th><th>Sold-through</th><th>Expired-through</th><th>Avg time</th><th>Avg score</th></tr></thead>
          <tbody>
            {r.members.length === 0 ? <tr><td colSpan={8} className="text-center text-sm text-[#6B7280] py-6">No data yet.</td></tr> : r.members.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{ROLE_LABEL[m.role as keyof typeof ROLE_LABEL] ?? m.role}</td>
                <td>{m.qualified}</td>
                <td>{m.unqualified}</td>
                <td>{m.sold_through}</td>
                <td>{m.expired_through}</td>
                <td>{m.avg_qual_minutes.toFixed(1)} min</td>
                <td>{m.avg_score.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
