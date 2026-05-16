// /crm/reports — CEO-only report index.

import Link from "next/link";
import { requireTeam } from "@/lib/crm/auth/rbac";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reports — NewWheels CRM" };

const REPORTS = [
  { href: "/crm/reports/revenue", title: "Revenue", desc: "Period revenue, by tier, by buyer, by source." },
  { href: "/crm/reports/lead-performance", title: "Lead performance", desc: "Qualification + sale + expiry rates, score distribution, demographics." },
  { href: "/crm/reports/team-performance", title: "Team performance", desc: "Per team-member productivity for HR + CEO." },
  { href: "/crm/reports/buyers", title: "Buyer & dealer", desc: "LTV, frequency, churn signals, sub-account utilization." },
  { href: "/crm/reports/lead-cost", title: "Lead cost breakdown", desc: "Unit economics for acquisition docs." },
];

export default async function ReportsIndex() {
  await requireTeam("ceo");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Reports</h1>
      <p className="text-sm text-[#6B7280]">Defaults: revenue = current month · lead performance = current week. Every report exports as CSV.</p>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {REPORTS.map((r) => (
          <li key={r.href} className="crm-card">
            <Link href={r.href} className="font-extrabold text-[#0A2818] hover:underline">{r.title}</Link>
            <p className="text-sm text-[#6B7280] mt-1">{r.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
