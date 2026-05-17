// /crm/buyers — BDR buyer-account pipeline view.
//
// Shows pending dealer + individual signups, verification status, and
// account activation dates. BDR + CEO + Platform Ops can see this.

import Link from "next/link";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Buyer pipeline — NewWheels CRM" };

type BuyerRow = {
  id: string;
  kind: string;
  status: string;
  business_name: string | null;
  contact_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  amvic_licence: string | null;
  dealership_name: string | null;
  dealership_address: string | null;
  dealership_phone: string | null;
  verified_at: string | null;
  created_at: string;
};

export default async function BuyerPipelinePage() {
  await requireTeam("bdr");
  const supabase = getServerSupabase();
  let buyers: BuyerRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("buyer_accounts")
      .select("id, kind, status, business_name, contact_name, first_name, last_name, email, phone, amvic_licence, dealership_name, dealership_address, dealership_phone, verified_at, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    buyers = (data ?? []) as BuyerRow[];
  }

  const groups: Record<string, BuyerRow[]> = {
    pending_verification: [],
    active: [],
    rejected: [],
    suspended: [],
  };
  for (const b of buyers) (groups[b.status] ??= []).push(b);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Buyer pipeline</h1>
          <p className="text-sm text-[#6B7280] mt-1">All dealer + individual buyer accounts.</p>
        </div>
      </div>

      {(["pending_verification", "active", "rejected", "suspended"] as const).map((s) => (
        <section key={s}>
          <h2 className="text-lg font-extrabold text-[#0A2818] mb-2">
            {s.replace(/_/g, " ")} <span className="text-sm font-normal text-[#6B7280]">· {groups[s].length}</span>
          </h2>
          {groups[s].length === 0 ? (
            <p className="text-sm text-[#6B7280]">None.</p>
          ) : (
            <ul className="divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] bg-white">
              {groups[s].map((b) => (
                <li key={b.id} className="p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#0A2818]">
                      {b.business_name ? `${b.business_name} — ${b.contact_name}` : (b.first_name && b.last_name ? `${b.first_name} ${b.last_name}` : b.contact_name)}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {b.kind.replace(/_/g, " ")} · {b.email}{b.phone ? ` · ${b.phone}` : ""}{b.amvic_licence ? ` · AMVIC ${b.amvic_licence}` : ""}
                    </p>
                    {b.dealership_name && (
                      <p className="text-xs text-[#6B7280]">
                        Dealership: {b.dealership_name}{b.dealership_address ? ` · ${b.dealership_address}` : ""}{b.dealership_phone ? ` · ${b.dealership_phone}` : ""}
                      </p>
                    )}
                    <p className="text-xs text-[#6B7280]">
                      Signed up {new Date(b.created_at).toLocaleDateString("en-CA")}
                      {b.verified_at ? ` · Verified ${new Date(b.verified_at).toLocaleDateString("en-CA")}` : ""}
                    </p>
                  </div>
                  {b.status === "pending_verification" ? (
                    <Link href={`/crm/admin/verifications/${b.id}`} className="text-xs underline text-[#0A2818]">
                      Review →
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
