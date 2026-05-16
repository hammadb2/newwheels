// /crm/reports/buyers — buyer + dealer report (monthly).

import Link from "next/link";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { defaultThisMonth, loadBuyerReport } from "@/lib/crm/reports/queries";
import { priceCentsToDisplay } from "@/lib/crm/pricing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Buyer report — NewWheels CRM" };

export default async function BuyerReportPage() {
  await requireTeam("ceo");
  const range = defaultThisMonth();
  const r = await loadBuyerReport(range);
  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Buyer & dealer report</h1>
        <Link href="/api/crm/reports/buyers.csv" className="crm-btn crm-btn-secondary">Download CSV</Link>
      </div>
      <p className="text-xs text-[#6B7280]">Period: {range.start.toLocaleDateString("en-CA")} → {range.end.toLocaleDateString("en-CA")}</p>

      <div className="crm-card p-0 overflow-x-auto">
        <table className="crm-table">
          <thead><tr><th>Buyer</th><th>Type</th><th>Status</th><th>Purchases</th><th>Spend (period)</th><th>Avg / lead</th><th>LTV</th><th>Last purchase</th></tr></thead>
          <tbody>
            {r.buyers.length === 0 ? <tr><td colSpan={8} className="text-center text-sm text-[#6B7280] py-6">No buyers.</td></tr> : r.buyers.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.kind === "dealer_master" ? "Dealer master" : b.kind === "dealer_sub" ? "Dealer sub" : "Individual"}</td>
                <td>{b.status.replace(/_/g, " ")}</td>
                <td>{b.purchases}</td>
                <td>{priceCentsToDisplay(b.spend_cents)}</td>
                <td>{priceCentsToDisplay(b.avg_price_cents)}</td>
                <td>{priceCentsToDisplay(b.lifetime_spend_cents)}</td>
                <td>{b.last_purchase_at ? new Date(b.last_purchase_at).toLocaleDateString("en-CA") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
