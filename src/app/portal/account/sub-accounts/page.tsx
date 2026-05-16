// /portal/account/sub-accounts — dealer master view of sub-accounts + budgets.

import { redirect } from "next/navigation";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { SubAccountsClient, type SubRow } from "@/components/portal/SubAccountsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sub-accounts — NewWheels Portal" };

export default async function SubAccountsPage() {
  const { subject } = await requireBuyer();
  if (subject.buyer_kind !== "dealer_master") {
    redirect("/portal/account");
  }
  const supabase = getServerSupabase();
  let subs: SubRow[] = [];
  let monthlyBudgetCents = 0;
  if (supabase) {
    const { data: master } = await supabase
      .from("buyer_accounts")
      .select("monthly_budget_cents")
      .eq("id", subject.buyer_account_id)
      .single();
    monthlyBudgetCents = Number(master?.monthly_budget_cents) || 0;
    const { data } = await supabase
      .from("buyer_accounts")
      .select("id, contact_name, email, sub_allocated_budget_cents, current_month_spent_cents, invoice_name")
      .eq("master_account_id", subject.buyer_account_id)
      .eq("kind", "dealer_sub")
      .neq("status", "suspended")
      .order("created_at", { ascending: false });
    subs = (data ?? []).map((s) => ({
      id: s.id as string,
      name: (s.contact_name as string) || (s.email as string),
      contact_email: s.email as string,
      monthly_budget_cents: Number(s.sub_allocated_budget_cents) || 0,
      current_month_spent_cents: Number(s.current_month_spent_cents) || 0,
      invoice_name: (s.invoice_name as string) ?? null,
    }));
  }
  return <SubAccountsClient initialSubs={subs} masterMonthlyBudgetCents={monthlyBudgetCents} />;
}
