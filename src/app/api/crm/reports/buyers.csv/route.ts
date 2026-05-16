// GET /api/crm/reports/buyers.csv

import { requireTeam } from "@/lib/crm/auth/rbac";
import { defaultThisMonth, loadBuyerReport } from "@/lib/crm/reports/queries";
import { csvResponse, toCsv } from "@/lib/crm/reports/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requireTeam("ceo");
  const range = defaultThisMonth();
  const r = await loadBuyerReport(range);
  const lines: (string | number)[][] = [
    ["NewWheels — Buyer & dealer report"],
    ["Period start", range.start.toISOString()],
    ["Period end", range.end.toISOString()],
    [],
    ["id", "kind", "name", "status", "purchases", "spend_cents", "avg_price_cents", "lifetime_spend_cents", "last_purchase_at"],
    ...r.buyers.map((b) => [b.id, b.kind, b.name, b.status, b.purchases, b.spend_cents, b.avg_price_cents, b.lifetime_spend_cents, b.last_purchase_at ?? ""]),
  ];
  return csvResponse(`buyers-${range.end.toISOString().slice(0, 10)}.csv`, toCsv(lines));
}
