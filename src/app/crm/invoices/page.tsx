// /crm/invoices — All purchase invoices visible to the entire CRM team.

import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { priceCentsToDisplay } from "@/lib/crm/pricing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoices — NewWheels CRM" };

type PurchaseRow = {
  id: string;
  amount_cents: number;
  tier: string;
  purchased_at: string;
  invoice_number: string | null;
  card_brand: string | null;
  card_last4: string | null;
  status: string;
  lead: { first_name: string; last_name: string; phone: string | null } | null;
  buyer: { contact_name: string; business_name: string | null } | null;
};

function formatBrand(brand: string): string {
  const map: Record<string, string> = {
    visa: "Visa",
    mastercard: "MC",
    amex: "Amex",
    discover: "Disc",
  };
  return map[brand.toLowerCase()] ?? brand;
}

export default async function InvoicesPage() {
  await requireTeam("any_team");

  const supabase = getServerSupabase();
  if (!supabase) return <p className="text-sm text-[#6B7280]">Not configured.</p>;

  const { data: purchases } = await supabase
    .from("purchases")
    .select("id, amount_cents, tier, purchased_at, invoice_number, card_brand, card_last4, status, lead:lead_id(first_name, last_name, phone), buyer:buyer_id(contact_name, business_name)")
    .order("purchased_at", { ascending: false })
    .limit(200);

  const rows = (purchases ?? []) as unknown as PurchaseRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Invoices</h1>
        <span className="text-sm text-[#6B7280]">{rows.length} purchases</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0A2818] text-[#D9FF4E] text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left font-bold">Invoice #</th>
              <th className="px-4 py-3 text-left font-bold">Date</th>
              <th className="px-4 py-3 text-left font-bold">Buyer</th>
              <th className="px-4 py-3 text-left font-bold">Lead</th>
              <th className="px-4 py-3 text-left font-bold">Phone</th>
              <th className="px-4 py-3 text-left font-bold">Tier</th>
              <th className="px-4 py-3 text-left font-bold">Payment</th>
              <th className="px-4 py-3 text-right font-bold">Amount</th>
              <th className="px-4 py-3 text-left font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F2EE]">
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-[#6B7280]">
                  No purchases yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-[#F5F7F4]">
                <td className="px-4 py-3 font-mono text-xs font-bold text-[#155235]">
                  {r.invoice_number ? `#${r.invoice_number}` : "—"}
                </td>
                <td className="px-4 py-3 text-[#0A2818]">
                  {new Date(r.purchased_at).toLocaleDateString("en-CA")}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-[#0A2818]">
                    {r.buyer ? ((r.buyer.business_name as string) || r.buyer.contact_name) : "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#0A2818]">
                  {r.lead ? `${r.lead.first_name} ${r.lead.last_name}`.trim() : "—"}
                </td>
                <td className="px-4 py-3 text-[#6B7280]">
                  {r.lead?.phone ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-[#F5F1E8] px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#0A2818]">
                    {r.tier}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#6B7280]">
                  {r.card_brand && r.card_last4
                    ? `${formatBrand(r.card_brand)} ••${r.card_last4}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#0A2818]">
                  {priceCentsToDisplay(r.amount_cents)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "inline-block rounded-full px-2 py-0.5 text-xs font-bold",
                      r.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : r.status === "refunded"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800",
                    ].join(" ")}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
