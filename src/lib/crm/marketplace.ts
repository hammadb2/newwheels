// Marketplace data access. All "what does the buyer see?" logic lives here so
// the page and API stay thin.
//
// The buyer never sees PII. They see: tier badge, situation summary, credit
// bracket, current price. After purchase they unlock the full record via the
// /portal/purchases/[id] route which does an additional permission check.

import { getServerSupabase } from "@/lib/crm/supabase/server";
import { currentPriceFor, priceCentsToDisplay } from "@/lib/crm/pricing";
import { buildSituationSummary } from "@/lib/crm/situation-summary";
import type { QualificationPayload, LeadTier } from "@/lib/crm/types";

export type MarketplaceFilters = {
  tier?: LeadTier | "all";
  body_type?: string | "all";
  visa_status?: string | "all";
  total_budget?: string | "all";
  down_payment?: string | "all";
  purchase_timeline?: string | "all";
  credit_bracket?: "poor" | "fair" | "good" | "all";
};

export type MarketplaceLeadCard = {
  id: string;
  first_name: string;
  tier: LeadTier;
  credit_bracket: "poor" | "fair" | "good";
  current_price_cents: number;
  current_price_display: string;
  situation_summary: string;
  // Score is included for sorting only — the buyer-facing UI must NOT render it.
  _score: number;
};

export async function loadMarketplace(filters: MarketplaceFilters = {}): Promise<MarketplaceLeadCard[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("leads")
    .select("id, first_name, score, tier, current_price_cents, starting_price_cents, available_at, raw_payload, status, fraud_risk, duplicate_of")
    .eq("status", "available")
    .order("score", { ascending: false })
    .order("available_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("loadMarketplace failed", error);
    return [];
  }

  const cards: MarketplaceLeadCard[] = [];
  for (const lead of data ?? []) {
    // Never sell fraud-flagged or duplicate leads.
    if (lead.fraud_risk === true || lead.duplicate_of != null) continue;
    const tier = (lead.tier as LeadTier) ?? "standard";

    if (filters.tier && filters.tier !== "all" && filters.tier !== tier) continue;

    const payload = (lead.raw_payload as Record<string, unknown> | null) ?? {};
    const credit_bracket = (payload.credit_bracket as "poor" | "fair" | "good") ?? creditFromScore(Number(lead.score) || 0);

    if (filters.credit_bracket && filters.credit_bracket !== "all" && filters.credit_bracket !== credit_bracket) continue;

    // Filter-by-qualification requires the qualification row.
    if (hasQualFilters(filters)) {
      const { data: qual } = await supabase
        .from("lead_qualifications")
        .select("visa_status, body_type, total_budget, down_payment, purchase_timeline")
        .eq("lead_id", lead.id)
        .single();
      if (!qual) continue;
      if (filters.body_type && filters.body_type !== "all" && qual.body_type !== filters.body_type) continue;
      if (filters.visa_status && filters.visa_status !== "all" && qual.visa_status !== filters.visa_status) continue;
      if (filters.total_budget && filters.total_budget !== "all" && qual.total_budget !== filters.total_budget) continue;
      if (filters.down_payment && filters.down_payment !== "all" && qual.down_payment !== filters.down_payment) continue;
      if (filters.purchase_timeline && filters.purchase_timeline !== "all" && qual.purchase_timeline !== filters.purchase_timeline) continue;
    }

    const summary = (payload.situation_summary as string) || (await rebuildSummary(supabase, lead.id as string));

    const price = currentPriceFor({
      tier,
      available_at: new Date(lead.available_at as string),
      now: new Date(),
    });
    if (price.expired) continue;

    cards.push({
      id: lead.id as string,
      first_name: lead.first_name as string,
      tier,
      credit_bracket,
      current_price_cents: price.price_cents,
      current_price_display: priceCentsToDisplay(price.price_cents),
      situation_summary: summary,
      _score: Number(lead.score) || 0,
    });
  }
  return cards;
}

function hasQualFilters(f: MarketplaceFilters): boolean {
  return Boolean(
    (f.body_type && f.body_type !== "all") ||
      (f.visa_status && f.visa_status !== "all") ||
      (f.total_budget && f.total_budget !== "all") ||
      (f.down_payment && f.down_payment !== "all") ||
      (f.purchase_timeline && f.purchase_timeline !== "all"),
  );
}

async function rebuildSummary(supabase: ReturnType<typeof getServerSupabase>, lead_id: string): Promise<string> {
  if (!supabase) return "";
  const { data: q } = await supabase
    .from("lead_qualifications")
    .select("*")
    .eq("lead_id", lead_id)
    .single();
  if (!q) return "";
  // Cast to QualificationPayload — the DB schema mirrors the payload type.
  return buildSituationSummary(q as unknown as QualificationPayload);
}

function creditFromScore(score: number): "poor" | "fair" | "good" {
  if (score >= 75) return "good";
  if (score >= 50) return "fair";
  return "poor";
}
