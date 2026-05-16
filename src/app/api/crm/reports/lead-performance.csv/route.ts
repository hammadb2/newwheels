// GET /api/crm/reports/lead-performance.csv

import { requireTeam } from "@/lib/crm/auth/rbac";
import { defaultThisWeek, loadLeadPerformanceReport } from "@/lib/crm/reports/queries";
import { csvResponse, toCsv } from "@/lib/crm/reports/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requireTeam("ceo");
  const range = defaultThisWeek();
  const r = await loadLeadPerformanceReport(range);
  const lines: (string | number)[][] = [
    ["NewWheels — Lead performance report"],
    ["Period start", range.start.toISOString()],
    ["Period end", range.end.toISOString()],
    [],
    ["received", r.received],
    ["qualified", r.qualified],
    ["sold", r.sold],
    ["expired", r.expired],
    ["qualification_rate", r.qualification_rate.toFixed(4)],
    ["sale_rate", r.sale_rate.toFixed(4)],
    ["expiry_rate", r.expiry_rate.toFixed(4)],
    ["avg_score", r.avg_score.toFixed(2)],
    [],
    ["Tier distribution"],
    ["tier", "count", "pct"],
    ...r.tier_distribution.map((row) => [row.tier, row.count, row.pct.toFixed(4)]),
    [],
    ["Top visa status"], ["value", "count"], ...r.top_visa.map((row) => [row.value, row.count]),
    [],
    ["Top monthly income"], ["value", "count"], ...r.top_income.map((row) => [row.value, row.count]),
    [],
    ["Top body type"], ["value", "count"], ...r.top_body.map((row) => [row.value, row.count]),
    [],
    ["Top budget"], ["value", "count"], ...r.top_budget.map((row) => [row.value, row.count]),
    [],
    ["Top timeline"], ["value", "count"], ...r.top_timeline.map((row) => [row.value, row.count]),
  ];
  return csvResponse(`lead-performance-${range.end.toISOString().slice(0, 10)}.csv`, toCsv(lines));
}
