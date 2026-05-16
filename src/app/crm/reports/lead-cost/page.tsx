// /crm/reports/lead-cost — unit economics report.

import Link from "next/link";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { defaultThisMonth, loadLeadCostReport } from "@/lib/crm/reports/queries";
import { priceCentsToDisplay } from "@/lib/crm/pricing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lead cost — NewWheels CRM" };

export default async function LeadCostReportPage() {
  await requireTeam("ceo");
  const range = defaultThisMonth();
  const r = await loadLeadCostReport(range);

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Lead cost breakdown</h1>
        <Link href="/api/crm/reports/lead-cost.csv" className="crm-btn crm-btn-secondary">Download CSV</Link>
      </div>
      <p className="text-xs text-[#6B7280]">Period: {range.start.toLocaleDateString("en-CA")} → {range.end.toLocaleDateString("en-CA")}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Revenue" value={priceCentsToDisplay(r.revenue_cents)} />
        <Stat label="Total cost" value={priceCentsToDisplay(r.cost_total_cents)} />
        <Stat label="Gross margin" value={priceCentsToDisplay(r.gross_margin_cents)} />
        <Stat label="Gross margin %" value={r.gross_margin_pct == null ? "—" : `${(r.gross_margin_pct * 100).toFixed(1)}%`} />
        <Stat label="Cost / raw lead" value={priceCentsToDisplay(r.acquisition_cost_per_lead_cents)} />
        <Stat label="Cost / qualified" value={priceCentsToDisplay(r.qualification_cost_per_qualified_cents)} />
        <Stat label="Cost / sellable" value={priceCentsToDisplay(r.cost_per_sellable_lead_cents)} />
        <Stat label="Breakeven" value={priceCentsToDisplay(r.breakeven_price_cents)} />
        <Stat label="Avg sale price" value={priceCentsToDisplay(r.avg_sale_price_cents)} />
        <Stat label="Expiry sunk cost" value={priceCentsToDisplay(r.expiry_cost_cents)} />
        <Stat label="Leads received" value={r.leads_received.toString()} />
        <Stat label="Leads qualified" value={r.leads_qualified.toString()} />
        <Stat label="Leads sold" value={r.leads_sold.toString()} />
      </div>

      <p className="text-xs text-[#6B7280]">
        Operating costs are read from <code>operating_costs</code>. Categorise rows as <code>acquisition</code>, <code>qualification</code>, or <code>platform</code> so this report stays accurate.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="crm-card">
      <p className="text-xs uppercase tracking-wider text-[#6B7280]">{label}</p>
      <p className="text-2xl font-extrabold text-[#0A2818]">{value}</p>
    </div>
  );
}
