// /portal/purchases — list of leads the buyer has purchased.

import Link from "next/link";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { priceCentsToDisplay } from "@/lib/crm/pricing";

export const dynamic = "force-dynamic";
export const metadata = { title: "My leads — NewWheels Portal" };

export default async function PurchasesPage() {
  const { subject } = await requireBuyer();
  const supabase = getServerSupabase();
  if (!supabase) {
    return <div className="text-sm text-[#6B7280]">Database not configured.</div>;
  }
  const { data } = await supabase
    .from("purchases")
    .select("id, amount_cents, tier, purchased_at, lead:lead_id(first_name, last_name, phone, raw_payload)")
    .eq("buyer_id", subject.buyer_account_id)
    .eq("status", "paid")
    .order("purchased_at", { ascending: false });

  type Row = {
    id: string;
    amount_cents: number;
    tier: string;
    purchased_at: string;
    lead: { first_name: string; last_name: string; phone: string; raw_payload: Record<string, unknown> | null } | null;
  };
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">My leads</h1>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center text-[#6B7280]">
          You haven&apos;t purchased any leads yet. Browse the <Link className="underline font-semibold" href="/portal/marketplace">marketplace</Link>.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((p) => (
            <li key={p.id} className="rounded-xl border border-[#E5E7EB] bg-white p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-extrabold text-[#0A2818]">{p.lead?.first_name} {p.lead?.last_name}</div>
                <div className="text-xs text-[#6B7280]">
                  {new Date(p.purchased_at).toLocaleString("en-CA")} · {p.tier.toUpperCase()} · {priceCentsToDisplay(p.amount_cents)}
                </div>
                <div className="text-sm text-[#0A2818] mt-1">{(p.lead?.raw_payload as Record<string, unknown> | null)?.situation_summary as string | undefined}</div>
              </div>
              <Link href={`/portal/purchases/${p.id}`} className="btn-secondary">Open</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
