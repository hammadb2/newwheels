// GET /api/crm/reports/team-performance.csv

import { requireTeam } from "@/lib/crm/auth/rbac";
import { defaultThisWeek, loadTeamPerformanceReport } from "@/lib/crm/reports/queries";
import { csvResponse, toCsv } from "@/lib/crm/reports/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requireTeam("hr");
  const range = defaultThisWeek();
  const r = await loadTeamPerformanceReport(range);
  const lines: (string | number)[][] = [
    ["NewWheels — Team performance report"],
    ["Period start", range.start.toISOString()],
    ["Period end", range.end.toISOString()],
    [],
    ["id", "name", "role", "qualified", "unqualified", "sold_through", "expired_through", "avg_qual_minutes", "avg_score"],
    ...r.members.map((m) => [m.id, m.name, m.role, m.qualified, m.unqualified, m.sold_through, m.expired_through, m.avg_qual_minutes.toFixed(1), m.avg_score.toFixed(2)]),
  ];
  return csvResponse(`team-performance-${range.end.toISOString().slice(0, 10)}.csv`, toCsv(lines));
}
