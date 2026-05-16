// /portal/pending — holding screen for buyers awaiting verification.

import { redirect } from "next/navigation";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account pending — NewWheels Portal" };

export default async function PortalPendingPage() {
  const { subject } = await requireBuyer();
  const supabase = getServerSupabase();
  if (!supabase) redirect("/portal/login");
  const { data } = await supabase
    .from("buyer_accounts")
    .select("status, rejection_reason")
    .eq("id", subject.buyer_account_id)
    .single();

  if (data?.status === "active") redirect("/portal/marketplace");

  return (
    <div className="max-w-xl mx-auto mt-12 rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
      {data?.status === "rejected" ? (
        <>
          <h1 className="text-2xl font-extrabold text-[#0A2818] mb-3">Verification rejected</h1>
          <p className="text-sm text-[#0A2818] mb-2">
            We weren&apos;t able to approve your account. Reason:{" "}
            <strong>{data?.rejection_reason || "Documents could not be validated"}</strong>.
          </p>
          <p className="text-sm text-[#6B7280]">
            Reply to your rejection email with updated documents and we&apos;ll re-review within one business day.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-extrabold text-[#0A2818] mb-3">Pending verification</h1>
          <p className="text-sm text-[#0A2818] mb-3">
            Your account is in our verification queue. You&apos;ll receive an email once approved — usually within one business day.
          </p>
          <p className="text-sm text-[#6B7280]">
            In the meantime: you can sign out and sign back in any time. No payment is taken until you click Buy Now on a specific lead.
          </p>
        </>
      )}
    </div>
  );
}
