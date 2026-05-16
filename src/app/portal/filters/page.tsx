// /portal/filters — saved filter sets. The buyer is notified by email when
// a new lead is published that matches one of these sets.

import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { SavedFiltersClient } from "@/components/portal/SavedFiltersClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Saved filters — NewWheels Portal" };

export default async function FiltersPage() {
  const { subject } = await requireBuyer();
  const supabase = getServerSupabase();
  const filters = supabase
    ? (await supabase
        .from("saved_filters")
        .select("id, name, filters, created_at")
        .eq("buyer_id", subject.buyer_account_id)
        .order("created_at", { ascending: false })).data ?? []
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Saved filters</h1>
      <p className="text-sm text-[#6B7280]">
        We&apos;ll email you when a new lead matching one of these saved searches goes live.
      </p>
      <SavedFiltersClient initial={filters as unknown as { id: string; name: string; filters: Record<string, string>; created_at: string }[]} />
    </div>
  );
}
