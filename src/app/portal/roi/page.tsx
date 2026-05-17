// /portal/roi — Dealer ROI dashboard.
//
// Shows: leads purchased this month, estimated deals closed (from feedback),
// estimated gross profit, total spend, estimated ROI.
// All clearly labelled as estimates.

import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "ROI Dashboard — NewWheels Portal" };

function cents(v: number): string {
  return `$${(v / 100).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`;
}

export default async function RoiDashboard() {
  const { subject } = await requireBuyer();
  const supabase = getServerSupabase();
  if (!supabase) return <p className="text-sm text-[#6B7280]">Not available.</p>;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Purchases this month
  const { data: purchases } = await supabase
    .from("purchases")
    .select("id, amount_cents, purchased_at")
    .eq("buyer_id", subject.buyer_account_id)
    .eq("status", "paid")
    .gte("purchased_at", monthStart.toISOString());

  const leadsThisMonth = purchases?.length ?? 0;
  const spendThisMonth = (purchases ?? []).reduce((sum, p) => sum + (Number(p.amount_cents) || 0), 0);

  // Feedback data for estimated deals
  const { data: feedback } = await supabase
    .from("purchase_feedback")
    .select("outcome")
    .eq("buyer_id", subject.buyer_account_id)
    .eq("outcome", "sold");

  const estimatedDeals = feedback?.length ?? 0;
  const avgProfitPerUnit = 200000; // $2,000 average gross profit per unit in cents
  const estimatedGrossProfit = estimatedDeals * avgProfitPerUnit;
  const estimatedRoi = spendThisMonth > 0
    ? ((estimatedGrossProfit - spendThisMonth) / spendThisMonth) * 100
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">ROI Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile label="Leads purchased this month" value={String(leadsThisMonth)} />
        <Tile label="Estimated deals closed" value={String(estimatedDeals)} note="Based on feedback responses" />
        <Tile label="Estimated gross profit" value={cents(estimatedGrossProfit)} note="At $2,000 avg per unit" />
        <Tile label="Total spend this month" value={cents(spendThisMonth)} />
        <Tile label="Estimated ROI" value={`${estimatedRoi.toFixed(0)}%`} />
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Disclaimer:</strong> Figures are estimates based on buyer-reported outcomes
        and an average gross profit of $2,000 per unit. These are not guaranteed and should
        be used for reference purposes only.
      </div>
    </div>
  );
}

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <p className="text-xs uppercase tracking-wider text-[#6B7280]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#0A2818]">{value}</p>
      {note && <p className="mt-1 text-xs text-[#6B7280]">{note}</p>}
    </div>
  );
}
