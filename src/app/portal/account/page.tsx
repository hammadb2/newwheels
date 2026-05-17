// /portal/account — basic buyer account screen.

import Link from "next/link";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { retrievePaymentMethodCard } from "@/lib/payments/stripe";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account — NewWheels Portal" };

export default async function AccountPage() {
  const { subject } = await requireBuyer();
  const supabase = getServerSupabase();
  let buyer: Record<string, unknown> | null = null;
  if (supabase) {
    const { data } = await supabase
      .from("buyer_accounts")
      .select("id, kind, status, business_name, contact_name, email, phone, amvic_licence, default_payment_method_id, created_at")
      .eq("id", subject.buyer_account_id)
      .single();
    buyer = data;
  }

  if (!buyer) return <p className="text-sm text-[#6B7280]">Account not found.</p>;

  const pmId = buyer.default_payment_method_id as string | null;
  const card = pmId ? await retrievePaymentMethodCard(pmId) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Account</h1>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-2">
        <Row label="Type" value={buyer.kind as string} />
        <Row label="Status" value={(buyer.status as string).replace(/_/g, " ")} />
        {buyer.business_name ? <Row label="Business" value={buyer.business_name as string} /> : null}
        <Row label="Contact" value={buyer.contact_name as string} />
        <Row label="Email" value={buyer.email as string} />
        <Row label="Phone" value={buyer.phone as string} />
        <Row label="AMVIC licence" value={buyer.amvic_licence as string} />
        <Row label="Member since" value={new Date(buyer.created_at as string).toLocaleDateString("en-CA")} />
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-2">
        <h2 className="font-extrabold text-[#0A2818]">Payment</h2>
        {card ? (
          <p className="text-sm text-[#0A2818]">
            Card on file: <span className="font-semibold capitalize">{card.brand}</span> •••• {card.last4}
          </p>
        ) : (
          <p className="text-sm text-[#0A2818]">
            {pmId
              ? "A card is on file. Stripe handles all charges. You can update it any time."
              : "No card on file. You need a valid card to unlock lead details and buy leads."}
          </p>
        )}
        <Link href="/portal/account/payment" className="btn-primary inline-flex">
          {pmId ? "Update card" : "Add card"}
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[#F1F2EE] py-2 last:border-b-0">
      <span className="text-xs uppercase tracking-wider text-[#6B7280]">{label}</span>
      <span className="text-sm font-semibold text-[#0A2818]">{value || "—"}</span>
    </div>
  );
}
