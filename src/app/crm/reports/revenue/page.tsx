// /crm/reports/revenue — CEO revenue report.

import Link from "next/link";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { defaultThisMonth, loadRevenueReport } from "@/lib/crm/reports/queries";
import { priceCentsToDisplay } from "@/lib/crm/pricing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Revenue report — NewWheels CRM" };

export default async function RevenueReportPage() {
  await requireTeam("ceo");
  const range = defaultThisMonth();
  const report = await loadRevenueReport(range);

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Revenue report</h1>
        <Link href="/api/crm/reports/revenue.csv" className="crm-btn crm-btn-secondary">Download CSV</Link>
      </div>
      <p className="text-xs text-[#6B7280]">Period: {range.start.toLocaleDateString("en-CA")} → {range.end.toLocaleDateString("en-CA")}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Revenue (period)" value={priceCentsToDisplay(report.revenue_cents_this)} />
        <Stat label="Revenue (previous)" value={priceCentsToDisplay(report.revenue_cents_last)} />
        <Stat label="Change" value={report.pct_change == null ? "—" : `${report.pct_change.toFixed(1)}%`} />
        <Stat label="Avg / day" value={priceCentsToDisplay(report.avg_revenue_per_day_cents)} />
        <Stat label="Projected month" value={priceCentsToDisplay(report.projected_monthly_revenue_cents)} />
      </div>

      <div className="crm-card p-0 overflow-x-auto">
        <h2 className="px-4 pt-4">By tier</h2>
        <table className="crm-table">
          <thead><tr><th>Tier</th><th>Leads sold</th><th>Revenue</th><th>Avg sale price</th></tr></thead>
          <tbody>
            {report.by_tier.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-sm text-[#6B7280] py-6">No sales this period.</td></tr>
            ) : report.by_tier.map((r) => (
              <tr key={r.tier}>
                <td>{r.tier.toUpperCase()}</td>
                <td>{r.leads_sold}</td>
                <td>{priceCentsToDisplay(r.revenue_cents)}</td>
                <td>{priceCentsToDisplay(r.avg_price_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="crm-card p-0 overflow-x-auto">
        <h2 className="px-4 pt-4">By buyer (top 50)</h2>
        <table className="crm-table">
          <thead><tr><th>Buyer</th><th>Purchases</th><th>Spend</th><th>Lifetime spend</th></tr></thead>
          <tbody>
            {report.by_buyer.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-sm text-[#6B7280] py-6">No purchases this period.</td></tr>
            ) : report.by_buyer.map((b) => (
              <tr key={b.buyer_id}>
                <td>{b.name}</td>
                <td>{b.purchases}</td>
                <td>{priceCentsToDisplay(b.total_spend_cents)}</td>
                <td>{priceCentsToDisplay(b.ltv_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
