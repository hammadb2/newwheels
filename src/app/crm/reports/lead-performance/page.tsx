// /crm/reports/lead-performance — CEO lead performance report.

import Link from "next/link";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { defaultThisWeek, loadLeadPerformanceReport } from "@/lib/crm/reports/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lead performance — NewWheels CRM" };

export default async function LeadPerfReport() {
  await requireTeam("ceo");
  const range = defaultThisWeek();
  const r = await loadLeadPerformanceReport(range);

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Lead performance</h1>
        <Link href="/api/crm/reports/lead-performance.csv" className="crm-btn crm-btn-secondary">Download CSV</Link>
      </div>
      <p className="text-xs text-[#6B7280]">Period: {range.start.toLocaleDateString("en-CA")} → {range.end.toLocaleDateString("en-CA")}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Received" value={r.received.toString()} />
        <Stat label="Qualified" value={r.qualified.toString()} />
        <Stat label="Sold" value={r.sold.toString()} />
        <Stat label="Expired" value={r.expired.toString()} />
        <Stat label="Qualification rate" value={pct(r.qualification_rate)} />
        <Stat label="Sale rate" value={pct(r.sale_rate)} />
        <Stat label="Expiry rate" value={pct(r.expiry_rate)} />
        <Stat label="Avg score" value={r.avg_score.toFixed(1)} />
      </div>

      <div className="crm-card">
        <h2>Tier distribution</h2>
        <ul className="text-sm space-y-1">
          {r.tier_distribution.length === 0 ? <li className="text-[#6B7280]">No qualified leads.</li> : r.tier_distribution.map((t) => (
            <li key={t.tier}>{t.tier.toUpperCase()} · {t.count} · {pct(t.pct)}</li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ListCard title="Top visa status" rows={r.top_visa} />
        <ListCard title="Top monthly income" rows={r.top_income} />
        <ListCard title="Top body type" rows={r.top_body} />
        <ListCard title="Top budget" rows={r.top_budget} />
        <ListCard title="Top timeline" rows={r.top_timeline} />
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

function ListCard({ title, rows }: { title: string; rows: { value: string; count: number }[] }) {
  return (
    <div className="crm-card">
      <h2>{title}</h2>
      {rows.length === 0 ? <p className="text-sm text-[#6B7280]">No data.</p> : (
        <ul className="text-sm space-y-1">{rows.map((r) => <li key={r.value}>{r.value} · {r.count}</li>)}</ul>
      )}
    </div>
  );
}

function pct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}
