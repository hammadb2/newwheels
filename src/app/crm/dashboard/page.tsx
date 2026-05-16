// /crm/dashboard — CEO live dashboard. Server-rendered with live counts.

import { requireTeam } from "@/lib/crm/auth/rbac";
import { loadDashboardMetrics } from "@/lib/crm/dashboard/metrics";
import { priceCentsToDisplay } from "@/lib/crm/pricing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — NewWheels CRM" };

export default async function CrmDashboardPage() {
  await requireTeam("ceo");
  const m = await loadDashboardMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Live dashboard</h1>
          <p className="text-sm text-[#6B7280] mt-1">Pulled at {new Date().toLocaleString("en-CA")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Leads today"      value={m.today.leads_received.toString()}         deltaVs={m.yesterday.leads_received} />
        <Stat label="Qualified today"  value={m.today.leads_qualified.toString()}         deltaVs={m.yesterday.leads_qualified} />
        <Stat label="Sold today"       value={m.today.leads_sold.toString()}              deltaVs={m.yesterday.leads_sold} />
        <Stat label="Revenue today"    value={priceCentsToDisplay(m.today.revenue_cents)} deltaVs={m.yesterday.revenue_cents > 0 ? Math.round(m.yesterday.revenue_cents / 100) : 0} deltaSuffix="$" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="crm-card">
          <h2>Marketplace</h2>
          <p className="crm-stat">{m.marketplace.available_now}</p>
          <p className="crm-stat-delta">leads live right now</p>
        </div>
        <div className="crm-card">
          <h2>Pending verifications</h2>
          <p className="crm-stat">{m.pending_verifications}</p>
          <p className="crm-stat-delta">awaiting CEO approval</p>
        </div>
        <div className="crm-card">
          <h2>Active buyer accounts</h2>
          <p className="crm-stat">{m.active_buyer_accounts}</p>
          <p className="crm-stat-delta">verified buyers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="crm-card">
          <h2>Revenue — month to date</h2>
          <p className="crm-stat">{priceCentsToDisplay(m.month.revenue_cents)}</p>
          <p className="crm-stat-delta">
            Last month: {priceCentsToDisplay(m.month.last_month_revenue_cents)}{" "}
            {pctChange(m.month.revenue_cents, m.month.last_month_revenue_cents)}
          </p>
        </div>
        <div className="crm-card">
          <h2>Today’s averages</h2>
          <p className="text-sm text-[#0A2818]">Avg lead score: <strong>{m.today.avg_score ?? "—"}</strong> / 100</p>
          <p className="text-sm text-[#0A2818]">Form → qualified: <strong>{m.today.avg_time_to_qualify_minutes ?? "—"}</strong> min</p>
          <p className="text-sm text-[#0A2818]">Expired unsold: <strong>{m.today.leads_expired}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="crm-card">
          <h2>Top qualifier today</h2>
          {m.top_team_member ? (
            <>
              <p className="crm-stat">{m.top_team_member.qualifications}</p>
              <p className="crm-stat-delta">leads — {m.top_team_member.name}</p>
            </>
          ) : (
            <p className="crm-stat-delta">No qualifications yet today.</p>
          )}
        </div>
        <div className="crm-card">
          <h2>Top buyer today</h2>
          {m.top_buyer ? (
            <>
              <p className="crm-stat">{m.top_buyer.purchases}</p>
              <p className="crm-stat-delta">leads — {m.top_buyer.name}</p>
            </>
          ) : (
            <p className="crm-stat-delta">No purchases yet today.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, deltaVs, deltaSuffix }: { label: string; value: string; deltaVs: number; deltaSuffix?: string }) {
  return (
    <div className="crm-card">
      <h2>{label}</h2>
      <p className="crm-stat">{value}</p>
      <p className="crm-stat-delta">vs {deltaSuffix ?? ""}{deltaVs} yesterday</p>
    </div>
  );
}

function pctChange(curr: number, prev: number): string {
  if (!prev) return "";
  const change = ((curr - prev) / prev) * 100;
  const rounded = Math.round(change);
  const sign = rounded > 0 ? "+" : "";
  return `(${sign}${rounded}% MoM)`;
}
