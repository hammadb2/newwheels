// /crm/admin/verifications — CEO + Platform Ops queue of buyers awaiting review.

import Link from "next/link";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verifications — NewWheels CRM" };

export default async function VerificationsPage() {
  await requireTeam("ceo");
  const supabase = getServerSupabase();
  const pending = supabase
    ? (await supabase
        .from("buyer_accounts")
        .select("id, kind, business_name, contact_name, email, phone, amvic_licence, created_at")
        .eq("status", "pending_verification")
        .order("created_at", { ascending: true })).data ?? []
    : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Verifications</h1>
      <p className="text-sm text-[#6B7280]">{pending.length} {pending.length === 1 ? "application" : "applications"} awaiting review</p>

      <div className="crm-card overflow-x-auto p-0">
        <table className="crm-table">
          <thead>
            <tr><th>Applicant</th><th>Type</th><th>Submitted</th><th>Action</th></tr>
          </thead>
          <tbody>
            {pending.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-sm text-[#6B7280] py-8">All caught up.</td></tr>
            ) : (
              pending.map((b) => (
                <tr key={b.id as string}>
                  <td>
                    <div className="font-semibold text-[#0A2818]">{(b.business_name as string) || (b.contact_name as string)}</div>
                    <div className="text-xs text-[#6B7280]">{b.email} · {b.phone} · AMVIC {b.amvic_licence}</div>
                  </td>
                  <td className="text-sm">{b.kind === "dealer_master" ? "Dealer master" : "Individual"}</td>
                  <td className="text-xs text-[#6B7280]">{new Date(b.created_at as string).toLocaleString("en-CA")}</td>
                  <td><Link href={`/crm/admin/verifications/${b.id}`} className="crm-btn crm-btn-secondary">Review</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
