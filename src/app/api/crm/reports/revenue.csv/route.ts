// GET /api/crm/reports/revenue.csv

import { requireTeam } from "@/lib/crm/auth/rbac";
import { defaultThisMonth, loadRevenueReport } from "@/lib/crm/reports/queries";
import { csvResponse, toCsv } from "@/lib/crm/reports/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requireTeam("ceo");
  const range = defaultThisMonth();
  const r = await loadRevenueReport(range);
  const lines: (string | number)[][] = [
    ["NewWheels — Revenue report"],
    ["Period start", range.start.toISOString()],
    ["Period end", range.end.toISOString()],
    [],
    ["Revenue this period (cents)", r.revenue_cents_this],
    ["Revenue previous period (cents)", r.revenue_cents_last],
    ["Pct change", r.pct_change == null ? "" : r.pct_change.toFixed(2)],
    ["Avg revenue per day (cents)", r.avg_revenue_per_day_cents],
    ["Projected monthly revenue (cents)", r.projected_monthly_revenue_cents],
    [],
    ["By tier"],
    ["tier", "leads_sold", "revenue_cents", "avg_price_cents"],
    ...r.by_tier.map((row) => [row.tier, row.leads_sold, row.revenue_cents, row.avg_price_cents]),
    [],
    ["By buyer"],
    ["buyer_id", "name", "total_spend_cents", "purchases", "ltv_cents"],
    ...r.by_buyer.map((row) => [row.buyer_id, row.name, row.total_spend_cents, row.purchases, row.ltv_cents]),
  ];
  return csvResponse(`revenue-${range.end.toISOString().slice(0, 10)}.csv`, toCsv(lines));
}
