// /portal/account/payment — collect a card via Stripe.js setup intent.

import { requireBuyer } from "@/lib/crm/auth/rbac";
import { PaymentClient } from "@/components/portal/PaymentClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Add card — NewWheels Portal" };

export default async function PaymentPage() {
  await requireBuyer();
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Add card</h1>
      <p className="text-sm text-[#6B7280]">
        We use Stripe to securely save your card. You won&apos;t be charged until you click Buy Now on a specific lead.
      </p>
      <PaymentClient stripePk={pk} />
    </div>
  );
}
