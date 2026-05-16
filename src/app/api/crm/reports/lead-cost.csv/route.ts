// GET /api/crm/reports/lead-cost.csv

import { requireTeam } from "@/lib/crm/auth/rbac";
import { defaultThisMonth, loadLeadCostReport } from "@/lib/crm/reports/queries";
import { csvResponse, toCsv } from "@/lib/crm/reports/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requireTeam("ceo");
  const range = defaultThisMonth();
  const r = await loadLeadCostReport(range);
  const lines: (string | number)[][] = [
    ["NewWheels — Lead cost breakdown"],
    ["Period start", range.start.toISOString()],
    ["Period end", range.end.toISOString()],
    [],
    ["revenue_cents", r.revenue_cents],
    ["cost_acquisition_cents", r.cost_acquisition_cents],
    ["cost_qualification_cents", r.cost_qualification_cents],
    ["cost_platform_cents", r.cost_platform_cents],
    ["cost_total_cents", r.cost_total_cents],
    ["leads_received", r.leads_received],
    ["leads_qualified", r.leads_qualified],
    ["leads_sold", r.leads_sold],
    ["acquisition_cost_per_lead_cents", r.acquisition_cost_per_lead_cents],
    ["qualification_cost_per_qualified_cents", r.qualification_cost_per_qualified_cents],
    ["cost_per_sellable_lead_cents", r.cost_per_sellable_lead_cents],
    ["breakeven_price_cents", r.breakeven_price_cents],
    ["avg_sale_price_cents", r.avg_sale_price_cents],
    ["gross_margin_cents", r.gross_margin_cents],
    ["gross_margin_pct", r.gross_margin_pct == null ? "" : r.gross_margin_pct.toFixed(4)],
    ["expiry_cost_cents", r.expiry_cost_cents],
  ];
  return csvResponse(`lead-cost-${range.end.toISOString().slice(0, 10)}.csv`, toCsv(lines));
}
