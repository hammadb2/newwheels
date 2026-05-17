// Backing queries for the generated reports. Kept in one file so it's easy
// to reason about + reuse the same query for both the HTML and CSV views.
//
// Each function takes a date range (UTC `start` <= row.created_at < `end`)
// and returns a structured object.

import { getServerSupabase } from "@/lib/crm/supabase/server";

export type DateRange = { start: Date; end: Date };

function iso(d: Date) {
  return d.toISOString();
}

export function defaultThisWeek(): DateRange {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { start, end };
}

export function defaultThisMonth(): DateRange {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return { start, end };
}

// ─────────────────────────────────────────────────────────────────────
// Revenue report
// ─────────────────────────────────────────────────────────────────────

export type RevenueReport = {
  revenue_cents_this: number;
  revenue_cents_last: number;
  pct_change: number | null;
  avg_revenue_per_day_cents: number;
  projected_monthly_revenue_cents: number;
  by_tier: { tier: string; leads_sold: number; revenue_cents: number; avg_price_cents: number }[];
  by_buyer: { buyer_id: string; name: string; total_spend_cents: number; purchases: number; ltv_cents: number }[];
};

export async function loadRevenueReport(range: DateRange): Promise<RevenueReport> {
  const supabase = getServerSupabase();
  if (!supabase) {
    return {
      revenue_cents_this: 0,
      revenue_cents_last: 0,
      pct_change: null,
      avg_revenue_per_day_cents: 0,
      projected_monthly_revenue_cents: 0,
      by_tier: [],
      by_buyer: [],
    };
  }
  const periodMs = range.end.getTime() - range.start.getTime();
  const lastStart = new Date(range.start.getTime() - periodMs);

  const { data: rowsThis } = await supabase
    .from("purchases")
    .select("amount_cents, tier, buyer_id")
    .eq("status", "paid")
    .gte("purchased_at", iso(range.start))
    .lt("purchased_at", iso(range.end));

  const { data: rowsLast } = await supabase
    .from("purchases")
    .select("amount_cents")
    .eq("status", "paid")
    .gte("purchased_at", iso(lastStart))
    .lt("purchased_at", iso(range.start));

  const revenue_cents_this = sum((rowsThis ?? []).map((r) => Number(r.amount_cents)));
  const revenue_cents_last = sum((rowsLast ?? []).map((r) => Number(r.amount_cents)));
  const pct_change = revenue_cents_last > 0 ? ((revenue_cents_this - revenue_cents_last) / revenue_cents_last) * 100 : null;
  const days = Math.max(1, Math.round(periodMs / (24 * 60 * 60 * 1000)));
  const avg_revenue_per_day_cents = Math.round(revenue_cents_this / days);
  const projected_monthly_revenue_cents = avg_revenue_per_day_cents * 30;

  const byTier = new Map<string, { leads_sold: number; revenue_cents: number }>();
  for (const r of rowsThis ?? []) {
    const t = (r.tier as string) || "standard";
    const cur = byTier.get(t) ?? { leads_sold: 0, revenue_cents: 0 };
    cur.leads_sold += 1;
    cur.revenue_cents += Number(r.amount_cents);
    byTier.set(t, cur);
  }
  const by_tier = Array.from(byTier.entries()).map(([tier, v]) => ({
    tier,
    leads_sold: v.leads_sold,
    revenue_cents: v.revenue_cents,
    avg_price_cents: v.leads_sold > 0 ? Math.round(v.revenue_cents / v.leads_sold) : 0,
  }));

  // By buyer (top 50).
  const byBuyer = new Map<string, { spend: number; count: number }>();
  for (const r of rowsThis ?? []) {
    const id = r.buyer_id as string;
    const cur = byBuyer.get(id) ?? { spend: 0, count: 0 };
    cur.spend += Number(r.amount_cents);
    cur.count += 1;
    byBuyer.set(id, cur);
  }
  const buyerIds = Array.from(byBuyer.keys());
  const { data: buyers } = buyerIds.length > 0
    ? await supabase.from("buyer_accounts").select("id, contact_name, business_name, lifetime_spend_cents").in("id", buyerIds)
    : { data: [] };
  const by_buyer = (buyers ?? []).map((b) => ({
    buyer_id: b.id as string,
    name: ((b.business_name as string) || (b.contact_name as string)) ?? (b.id as string),
    total_spend_cents: byBuyer.get(b.id as string)?.spend ?? 0,
    purchases: byBuyer.get(b.id as string)?.count ?? 0,
    ltv_cents: Number(b.lifetime_spend_cents) || 0,
  })).sort((a, b) => b.total_spend_cents - a.total_spend_cents).slice(0, 50);

  return {
    revenue_cents_this,
    revenue_cents_last,
    pct_change,
    avg_revenue_per_day_cents,
    projected_monthly_revenue_cents,
    by_tier,
    by_buyer,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Lead performance
// ─────────────────────────────────────────────────────────────────────

export type LeadPerformanceReport = {
  received: number;
  qualified: number;
  sold: number;
  expired: number;
  qualification_rate: number;
  sale_rate: number;
  expiry_rate: number;
  avg_score: number;
  tier_distribution: { tier: string; count: number; pct: number }[];
  top_visa: { value: string; count: number }[];
  top_income: { value: string; count: number }[];
  top_body: { value: string; count: number }[];
  top_budget: { value: string; count: number }[];
  top_timeline: { value: string; count: number }[];
};

export async function loadLeadPerformanceReport(range: DateRange): Promise<LeadPerformanceReport> {
  const supabase = getServerSupabase();
  if (!supabase) {
    return {
      received: 0, qualified: 0, sold: 0, expired: 0,
      qualification_rate: 0, sale_rate: 0, expiry_rate: 0, avg_score: 0,
      tier_distribution: [], top_visa: [], top_income: [], top_body: [], top_budget: [], top_timeline: [],
    };
  }

  const startIso = iso(range.start);
  const endIso = iso(range.end);

  const { data: receivedRows } = await supabase
    .from("leads")
    .select("id, status, score, tier, raw_payload, qualified_at, sold_at, expired_at, created_at")
    .gte("created_at", startIso)
    .lt("created_at", endIso);

  const received = (receivedRows ?? []).length;
  const qualified = (receivedRows ?? []).filter((r) => r.qualified_at != null).length;
  const sold = (receivedRows ?? []).filter((r) => r.sold_at != null).length;
  const expired = (receivedRows ?? []).filter((r) => r.expired_at != null).length;

  const qualification_rate = received > 0 ? qualified / received : 0;
  const sale_rate = qualified > 0 ? sold / qualified : 0;
  const expiry_rate = qualified > 0 ? expired / qualified : 0;
  const scores = (receivedRows ?? []).map((r) => Number(r.score)).filter((s) => Number.isFinite(s) && s > 0);
  const avg_score = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const tierMap = new Map<string, number>();
  for (const r of receivedRows ?? []) {
    if (!r.tier) continue;
    tierMap.set(r.tier as string, (tierMap.get(r.tier as string) ?? 0) + 1);
  }
  const totalTiered = Array.from(tierMap.values()).reduce((a, b) => a + b, 0);
  const tier_distribution = Array.from(tierMap.entries()).map(([tier, count]) => ({
    tier, count, pct: totalTiered > 0 ? count / totalTiered : 0,
  }));

  function topN<K extends string>(field: K, n = 5): { value: string; count: number }[] {
    const m = new Map<string, number>();
    for (const r of receivedRows ?? []) {
      const v = ((r.raw_payload as Record<string, unknown> | null) ?? {})[field] as string | undefined;
      if (!v) continue;
      m.set(v, (m.get(v) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([value, count]) => ({ value, count }));
  }

  return {
    received, qualified, sold, expired,
    qualification_rate, sale_rate, expiry_rate, avg_score,
    tier_distribution,
    top_visa: topN("visa_status"),
    top_income: topN("monthly_income"),
    top_body: topN("body_type"),
    top_budget: topN("total_budget"),
    top_timeline: topN("purchase_timeline"),
  };
}

// ─────────────────────────────────────────────────────────────────────
// Team performance
// ─────────────────────────────────────────────────────────────────────

export type TeamPerformanceReport = {
  members: {
    id: string;
    name: string;
    role: string;
    qualified: number;
    unqualified: number;
    sold_through: number;
    expired_through: number;
    avg_qual_minutes: number;
    avg_score: number;
  }[];
};

export async function loadTeamPerformanceReport(range: DateRange): Promise<TeamPerformanceReport> {
  const supabase = getServerSupabase();
  if (!supabase) return { members: [] };

  const { data: members } = await supabase
    .from("team_members")
    .select("id, display_name, role")
    .eq("active", true);

  const { data: leads } = await supabase
    .from("leads")
    .select("id, status, score, qualified_by_id, qualified_at, sold_at, expired_at, created_at")
    .gte("qualified_at", iso(range.start))
    .lt("qualified_at", iso(range.end));

  const rows: TeamPerformanceReport["members"] = [];
  for (const m of members ?? []) {
    const id = m.id as string;
    const mine = (leads ?? []).filter((l) => l.qualified_by_id === id);
    const qualified = mine.filter((l) => l.status !== "unqualified").length;
    const unqualified = mine.filter((l) => l.status === "unqualified").length;
    const sold_through = mine.filter((l) => l.sold_at != null).length;
    const expired_through = mine.filter((l) => l.expired_at != null).length;
    const minutes = mine
      .filter((l) => l.created_at && l.qualified_at)
      .map((l) => (new Date(l.qualified_at as string).getTime() - new Date(l.created_at as string).getTime()) / 60000)
      .filter((n) => Number.isFinite(n) && n >= 0);
    const avg_qual_minutes = minutes.length > 0 ? minutes.reduce((a, b) => a + b, 0) / minutes.length : 0;
    const scores = mine.map((l) => Number(l.score)).filter((s) => Number.isFinite(s) && s > 0);
    const avg_score = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    rows.push({
      id, name: m.display_name as string, role: m.role as string,
      qualified, unqualified, sold_through, expired_through, avg_qual_minutes, avg_score,
    });
  }
  return { members: rows };
}

// ─────────────────────────────────────────────────────────────────────
// Buyer + dealer report
// ─────────────────────────────────────────────────────────────────────

export type BuyerReport = {
  buyers: {
    id: string;
    kind: string;
    name: string;
    purchases: number;
    spend_cents: number;
    avg_price_cents: number;
    last_purchase_at: string | null;
    lifetime_spend_cents: number;
    status: string;
    churn_flag: boolean;
  }[];
};

export async function loadBuyerReport(range: DateRange): Promise<BuyerReport> {
  const supabase = getServerSupabase();
  if (!supabase) return { buyers: [] };

  const { data: buyers } = await supabase
    .from("buyer_accounts")
    .select("id, kind, status, business_name, contact_name, lifetime_spend_cents, last_purchase_at");

  const { data: purchases } = await supabase
    .from("purchases")
    .select("buyer_id, amount_cents")
    .eq("status", "paid")
    .gte("purchased_at", iso(range.start))
    .lt("purchased_at", iso(range.end));

  const byBuyer = new Map<string, { spend: number; count: number }>();
  for (const p of purchases ?? []) {
    const id = p.buyer_id as string;
    const cur = byBuyer.get(id) ?? { spend: 0, count: 0 };
    cur.spend += Number(p.amount_cents);
    cur.count += 1;
    byBuyer.set(id, cur);
  }

  // Compute weekly purchase counts for churn detection
  const twoWeeksAgo = new Date(range.end.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(range.end.getTime() - 7 * 24 * 60 * 60 * 1000);
  const { data: prevWeek } = await supabase
    .from("purchases")
    .select("buyer_id")
    .eq("status", "paid")
    .gte("purchased_at", iso(twoWeeksAgo))
    .lt("purchased_at", iso(oneWeekAgo));
  const { data: thisWeek } = await supabase
    .from("purchases")
    .select("buyer_id")
    .eq("status", "paid")
    .gte("purchased_at", iso(oneWeekAgo))
    .lt("purchased_at", iso(range.end));
  const prevCounts = new Map<string, number>();
  for (const p of prevWeek ?? []) {
    const id = p.buyer_id as string;
    prevCounts.set(id, (prevCounts.get(id) ?? 0) + 1);
  }
  const thisCounts = new Map<string, number>();
  for (const p of thisWeek ?? []) {
    const id = p.buyer_id as string;
    thisCounts.set(id, (thisCounts.get(id) ?? 0) + 1);
  }

  const rows = (buyers ?? []).map((b) => {
    const id = b.id as string;
    const v = byBuyer.get(id) ?? { spend: 0, count: 0 };
    const prev = prevCounts.get(id) ?? 0;
    const curr = thisCounts.get(id) ?? 0;
    const churn_flag = prev > 0 && curr < prev * 0.5;
    return {
      id,
      kind: (b.kind as string) ?? "individual",
      name: ((b.business_name as string) || (b.contact_name as string)) ?? id,
      purchases: v.count,
      spend_cents: v.spend,
      avg_price_cents: v.count > 0 ? Math.round(v.spend / v.count) : 0,
      last_purchase_at: (b.last_purchase_at as string) ?? null,
      lifetime_spend_cents: Number(b.lifetime_spend_cents) || 0,
      status: (b.status as string) ?? "active",
      churn_flag,
    };
  });
  return { buyers: rows.sort((a, b) => b.spend_cents - a.spend_cents) };
}

// ─────────────────────────────────────────────────────────────────────
// Lead cost breakdown
// ─────────────────────────────────────────────────────────────────────

export type LeadCostReport = {
  revenue_cents: number;
  cost_acquisition_cents: number;
  cost_qualification_cents: number;
  cost_platform_cents: number;
  cost_total_cents: number;
  leads_received: number;
  leads_qualified: number;
  leads_sold: number;
  acquisition_cost_per_lead_cents: number;
  qualification_cost_per_qualified_cents: number;
  cost_per_sellable_lead_cents: number;
  breakeven_price_cents: number;
  avg_sale_price_cents: number;
  gross_margin_cents: number;
  gross_margin_pct: number | null;
  expiry_cost_cents: number;
};

export async function loadLeadCostReport(range: DateRange): Promise<LeadCostReport> {
  const supabase = getServerSupabase();
  if (!supabase) {
    return {
      revenue_cents: 0, cost_acquisition_cents: 0, cost_qualification_cents: 0, cost_platform_cents: 0,
      cost_total_cents: 0, leads_received: 0, leads_qualified: 0, leads_sold: 0,
      acquisition_cost_per_lead_cents: 0, qualification_cost_per_qualified_cents: 0,
      cost_per_sellable_lead_cents: 0, breakeven_price_cents: 0, avg_sale_price_cents: 0,
      gross_margin_cents: 0, gross_margin_pct: null, expiry_cost_cents: 0,
    };
  }

  const { data: costs } = await supabase
    .from("operating_costs")
    .select("category, amount_cents")
    .gte("incurred_on", iso(range.start).slice(0, 10))
    .lt("incurred_on", iso(range.end).slice(0, 10));

  let acq = 0, qual = 0, plat = 0;
  for (const c of costs ?? []) {
    const a = Number(c.amount_cents) || 0;
    if (c.category === "acquisition") acq += a;
    else if (c.category === "qualification") qual += a;
    else plat += a;
  }

  const { data: leadsInRange } = await supabase
    .from("leads")
    .select("id, status, qualified_at, sold_at, expired_at, current_price_cents")
    .gte("created_at", iso(range.start))
    .lt("created_at", iso(range.end));

  const leads_received = (leadsInRange ?? []).length;
  const leads_qualified = (leadsInRange ?? []).filter((l) => l.qualified_at).length;
  const leads_sold = (leadsInRange ?? []).filter((l) => l.sold_at).length;

  const { data: purchases } = await supabase
    .from("purchases")
    .select("amount_cents")
    .eq("status", "paid")
    .gte("purchased_at", iso(range.start))
    .lt("purchased_at", iso(range.end));
  const revenue_cents = sum((purchases ?? []).map((p) => Number(p.amount_cents)));

  const cost_total_cents = acq + qual + plat;
  const acquisition_cost_per_lead_cents = leads_received > 0 ? Math.round(acq / leads_received) : 0;
  const qualification_cost_per_qualified_cents = leads_qualified > 0 ? Math.round(qual / leads_qualified) : 0;
  const cost_per_sellable_lead_cents = acquisition_cost_per_lead_cents + qualification_cost_per_qualified_cents;
  const avg_sale_price_cents = leads_sold > 0 ? Math.round(revenue_cents / leads_sold) : 0;
  const gross_margin_cents = revenue_cents - cost_total_cents;
  const gross_margin_pct = revenue_cents > 0 ? gross_margin_cents / revenue_cents : null;
  const expiry_cost_cents = (leadsInRange ?? []).filter((l) => l.expired_at).length * cost_per_sellable_lead_cents;

  return {
    revenue_cents,
    cost_acquisition_cents: acq,
    cost_qualification_cents: qual,
    cost_platform_cents: plat,
    cost_total_cents,
    leads_received,
    leads_qualified,
    leads_sold,
    acquisition_cost_per_lead_cents,
    qualification_cost_per_qualified_cents,
    cost_per_sellable_lead_cents,
    breakeven_price_cents: cost_per_sellable_lead_cents,
    avg_sale_price_cents,
    gross_margin_cents,
    gross_margin_pct,
    expiry_cost_cents,
  };
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}
