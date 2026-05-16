// /portal/marketplace — the lead marketplace.
//
// Buyers only see leads when their account is `active` AND they have a
// validated card on file. Otherwise the cards are blurred and Buy Now is
// disabled (the spec is explicit about this for individual buyers).

import Link from "next/link";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { loadMarketplace, type MarketplaceFilters } from "@/lib/crm/marketplace";
import { loadOnboardingChecklist } from "@/lib/crm/onboarding";
import {
  BODY_TYPE_OPTIONS,
  DOWN_PAYMENT_OPTIONS,
  PURCHASE_TIMELINE_OPTIONS,
  TOTAL_BUDGET_OPTIONS,
  VISA_OPTIONS,
} from "@/lib/crm/types";
import { MarketplaceCard } from "@/components/portal/MarketplaceCard";
import { OnboardingChecklist } from "@/components/portal/OnboardingChecklist";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marketplace — NewWheels Portal" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MarketplacePage({ searchParams }: { searchParams: SearchParams }) {
  const { subject } = await requireBuyer();
  const params = await searchParams;

  const filters: MarketplaceFilters = {
    tier: pickEnum(params.tier, ["all", "hot", "warm", "standard"] as const, "all"),
    credit_bracket: pickEnum(params.credit, ["all", "poor", "fair", "good"] as const, "all"),
    body_type: pickValue(params.body, BODY_TYPE_OPTIONS.map((o) => o.value), "all"),
    visa_status: pickValue(params.visa, VISA_OPTIONS.map((o) => o.value), "all"),
    total_budget: pickValue(params.budget, TOTAL_BUDGET_OPTIONS.map((o) => o.value), "all"),
    down_payment: pickValue(params.down, DOWN_PAYMENT_OPTIONS.map((o) => o.value), "all"),
    purchase_timeline: pickValue(params.tl, PURCHASE_TIMELINE_OPTIONS.map((o) => o.value), "all"),
  };

  const cards = await loadMarketplace(filters);

  // Card-on-file check: individual buyers must have a stripe payment method.
  const supabase = getServerSupabase();
  let cardOnFile = false;
  if (supabase) {
    const { data: buyer } = await supabase
      .from("buyer_accounts")
      .select("status, stripe_customer_id, default_payment_method_id, kind")
      .eq("id", subject.buyer_account_id)
      .single();
    cardOnFile = !!(buyer?.default_payment_method_id);
  }

  const onboarding = subject.buyer_kind === "dealer_master"
    ? await loadOnboardingChecklist(subject.buyer_account_id)
    : { steps: [], complete: true };

  return (
    <div className="space-y-6">
      {!onboarding.complete && <OnboardingChecklist steps={onboarding.steps} />}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Lead marketplace</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {cards.length} {cards.length === 1 ? "lead" : "leads"} available now · sorted by quality
          </p>
        </div>
        {!cardOnFile && (
          <Link className="btn-secondary" href="/portal/account/payment">
            Add card to unlock Buy Now →
          </Link>
        )}
      </div>

      <form className="rounded-2xl border border-[#E5E7EB] bg-white p-4 grid grid-cols-2 md:grid-cols-4 gap-3" method="get">
        <FilterSelect name="tier" label="Tier" current={String(params.tier ?? "all")} options={[
          { value: "all", label: "All" }, { value: "hot", label: "Hot" }, { value: "warm", label: "Warm" }, { value: "standard", label: "Standard" },
        ]} />
        <FilterSelect name="credit" label="Credit" current={String(params.credit ?? "all")} options={[
          { value: "all", label: "All" }, { value: "good", label: "Good" }, { value: "fair", label: "Fair" }, { value: "poor", label: "Poor" },
        ]} />
        <FilterSelect name="body" label="Body type" current={String(params.body ?? "all")} options={[
          { value: "all", label: "All" }, ...BODY_TYPE_OPTIONS,
        ]} />
        <FilterSelect name="visa" label="Visa status" current={String(params.visa ?? "all")} options={[
          { value: "all", label: "All" }, ...VISA_OPTIONS,
        ]} />
        <FilterSelect name="budget" label="Budget" current={String(params.budget ?? "all")} options={[
          { value: "all", label: "All" }, ...TOTAL_BUDGET_OPTIONS,
        ]} />
        <FilterSelect name="down" label="Down payment" current={String(params.down ?? "all")} options={[
          { value: "all", label: "All" }, ...DOWN_PAYMENT_OPTIONS,
        ]} />
        <FilterSelect name="tl" label="Timeline" current={String(params.tl ?? "all")} options={[
          { value: "all", label: "All" }, ...PURCHASE_TIMELINE_OPTIONS,
        ]} />
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary flex-1">Apply</button>
          <Link href="/portal/marketplace" className="btn-secondary flex-1 text-center">Reset</Link>
        </div>
      </form>

      <p className="text-xs text-[#6B7280]">
        Lead purchases are final. NewWheels does not guarantee contact or conversion. By purchasing you agree to the NewWheels Terms of Use.
      </p>

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center text-[#6B7280]">
          No matching leads right now. Save a filter and we&apos;ll email you when new ones arrive.
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <li key={c.id}>
              <MarketplaceCard card={c} cardOnFile={cardOnFile} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterSelect({ name, label, current, options }: {
  name: string; label: string; current: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[#0A2818] mb-1">{label}</span>
      <select name={name} defaultValue={current} className="portal-select">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function pickEnum<T extends readonly string[]>(
  raw: string | string[] | undefined,
  allowed: T,
  fallback: T[number],
): T[number] {
  const v = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  return (allowed as readonly string[]).includes(v ?? "") ? (v as T[number]) : fallback;
}

function pickValue<T extends string>(
  raw: string | string[] | undefined,
  allowed: readonly T[],
  fallback: "all",
): T | "all" {
  const v = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  if (v === "all") return "all";
  return (allowed as readonly string[]).includes(v ?? "") ? (v as T) : fallback;
}
