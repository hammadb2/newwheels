// /crm/pipeline — full lead pipeline view for CEO + Platform Ops.
// Includes a "Re-list" button for expired leads (resets to $75 floor).

import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { priceCentsToDisplay } from "@/lib/crm/pricing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pipeline — NewWheels CRM" };

export default async function PipelinePage() {
  await requireTeam("platform_ops");
  const supabase = getServerSupabase();
  const { data: rows } = supabase
    ? await supabase
        .from("leads")
        .select("id, first_name, last_name, status, tier, score, current_price_cents, available_at, expires_at, sold_at, created_at")
        .order("created_at", { ascending: false })
        .limit(500)
    : { data: [] };

  const buckets: Record<string, Row[]> = {
    new: [],
    qualifying: [],
    available: [],
    sold: [],
    expired: [],
    unqualified: [],
    duplicate: [],
  };
  for (const r of (rows ?? []) as Row[]) {
    const key = (r.status as string) ?? "new";
    if (buckets[key]) buckets[key].push(r);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Lead pipeline</h1>

      <Section title="Available" rows={buckets.available} showPrice />
      <Section title="Sold" rows={buckets.sold} showPrice />
      <Section title="Expired (CEO can re-list)" rows={buckets.expired} showPrice showRelist />
      <Section title="Qualifying" rows={buckets.qualifying} />
      <Section title="New" rows={buckets.new} />
      <Section title="Unqualified" rows={buckets.unqualified} />
      <Section title="Duplicates" rows={buckets.duplicate} />
    </div>
  );
}

type Row = { id: string; first_name: string; last_name: string; status?: string | null; tier?: string | null; score?: number | null; current_price_cents?: number | null; created_at?: string };

function Section({ title, rows, showPrice, showRelist }: { title: string; rows: unknown[] | null | undefined; showPrice?: boolean; showRelist?: boolean }) {
  const list = (rows ?? []) as Row[];
  return (
    <div>
      <h2 className="text-base font-extrabold text-[#0A2818] mb-2">{title} <span className="text-xs text-[#6B7280]">({list.length})</span></h2>
      {list.length === 0 ? (
        <p className="text-sm text-[#6B7280]">Empty.</p>
      ) : (
        <div className="crm-card p-0 overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Tier / Score</th>
                {showPrice && <th>Price</th>}
                <th>Received</th>
                {showRelist && <th></th>}
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.first_name} {r.last_name}</td>
                  <td className="text-sm">{(r.tier as string) || "—"} {r.score != null ? `· ${r.score}` : ""}</td>
                  {showPrice && <td className="text-sm">{r.current_price_cents != null ? priceCentsToDisplay(r.current_price_cents) : "—"}</td>}
                  <td className="text-xs text-[#6B7280]">{r.created_at ? new Date(r.created_at).toLocaleString("en-CA") : "—"}</td>
                  {showRelist && (
                    <td>
                      <form action={`/api/crm/leads/${r.id}/relist`} method="post">
                        <button type="submit" className="crm-btn crm-btn-secondary">Re-list at $75</button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
