// Dealer master onboarding checklist.
//
// Shown until all five steps are complete. Each step is a boolean derived
// from current account state.

import { getServerSupabase } from "@/lib/crm/supabase/server";

export type OnboardingStep = {
  key: string;
  label: string;
  href: string;
  done: boolean;
};

export async function loadOnboardingChecklist(buyerId: string): Promise<{ steps: OnboardingStep[]; complete: boolean }> {
  const supabase = getServerSupabase();
  if (!supabase) {
    return { steps: [], complete: true };
  }
  const { data: buyer } = await supabase
    .from("buyer_accounts")
    .select("kind, default_payment_method_id, monthly_budget_cents")
    .eq("id", buyerId)
    .single();
  if (!buyer || buyer.kind !== "dealer_master") {
    return { steps: [], complete: true };
  }
  const { count: subCount } = await supabase
    .from("buyer_accounts")
    .select("id", { count: "exact", head: true })
    .eq("master_account_id", buyerId)
    .eq("kind", "dealer_sub")
    .neq("status", "suspended");
  const { count: filterCount } = await supabase
    .from("saved_filters")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", buyerId);
  const { count: purchaseCount } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", buyerId);

  const steps: OnboardingStep[] = [
    { key: "payment", label: "Add a payment method", href: "/portal/account/payment", done: Boolean(buyer.default_payment_method_id) },
    { key: "budget", label: "Set your monthly budget", href: "/portal/account/sub-accounts", done: (Number(buyer.monthly_budget_cents) || 0) > 0 },
    { key: "sub", label: "Create your first sub-account", href: "/portal/account/sub-accounts", done: (subCount ?? 0) > 0 },
    { key: "filter", label: "Set up saved lead filters", href: "/portal/filters", done: (filterCount ?? 0) > 0 },
    { key: "browse", label: "Browse the marketplace", href: "/portal/marketplace", done: (purchaseCount ?? 0) > 0 },
  ];
  const complete = steps.every((s) => s.done);
  return { steps, complete };
}
