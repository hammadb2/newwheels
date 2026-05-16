// Server-side computation of the CEO live dashboard metrics.
//
// All counts/sums are read directly from the leads/purchases tables and are
// "live enough" for the dashboard. For longer-window reports we use the
// nw.daily_metrics snapshot table populated by cron.

import { getServerSupabase } from "@/lib/crm/supabase/server";

export type DashboardMetrics = {
  today: {
    leads_received: number;
    leads_qualified: number;
    leads_sold: number;
    revenue_cents: number;
    leads_expired: number;
    avg_score: number | null;
    avg_time_to_qualify_minutes: number | null;
  };
  yesterday: {
    leads_received: number;
    leads_qualified: number;
    leads_sold: number;
    revenue_cents: number;
  };
  marketplace: {
    available_now: number;
  };
  month: {
    revenue_cents: number;
    last_month_revenue_cents: number;
  };
  top_team_member: { name: string; qualifications: number } | null;
  top_buyer: { name: string; purchases: number } | null;
  active_buyer_accounts: number;
  pending_verifications: number;
};

export async function loadDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = getServerSupabase();
  if (!supabase) return emptyMetrics();

  const today = startOfDay(new Date());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  // Today's lead counts.
  const [
    leadsToday,
    leadsYesterday,
    qualifiedToday,
    qualifiedYesterday,
    soldToday,
    soldYesterday,
    expiredToday,
    availableNow,
    pendingVerifications,
    activeBuyers,
  ] = await Promise.all([
    countLeadsInRange(today, tomorrow),
    countLeadsInRange(yesterday, today),
    countQualifiedInRange(today, tomorrow),
    countQualifiedInRange(yesterday, today),
    countSoldInRange(today, tomorrow),
    countSoldInRange(yesterday, today),
    countExpiredInRange(today, tomorrow),
    countAvailableNow(),
    countPendingVerifications(),
    countActiveBuyers(),
  ]);

  const [revToday, revYesterday] = await Promise.all([
    sumRevenueInRange(today, tomorrow),
    sumRevenueInRange(yesterday, today),
  ]);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const [revMonth, revLastMonth] = await Promise.all([
    sumRevenueInRange(monthStart, tomorrow),
    sumRevenueInRange(lastMonthStart, monthStart),
  ]);

  const avg_score = await avgScoreInRange(today, tomorrow);
  const avg_time_to_qualify_minutes = await avgTimeToQualifyMinutes(today, tomorrow);
  const top_team_member = await topQualifier(today, tomorrow);
  const top_buyer = await topBuyer(today, tomorrow);

  return {
    today: {
      leads_received: leadsToday,
      leads_qualified: qualifiedToday,
      leads_sold: soldToday,
      revenue_cents: revToday,
      leads_expired: expiredToday,
      avg_score,
      avg_time_to_qualify_minutes,
    },
    yesterday: {
      leads_received: leadsYesterday,
      leads_qualified: qualifiedYesterday,
      leads_sold: soldYesterday,
      revenue_cents: revYesterday,
    },
    marketplace: { available_now: availableNow },
    month: { revenue_cents: revMonth, last_month_revenue_cents: revLastMonth },
    top_team_member,
    top_buyer,
    active_buyer_accounts: activeBuyers,
    pending_verifications: pendingVerifications,
  };
}

function emptyMetrics(): DashboardMetrics {
  return {
    today: { leads_received: 0, leads_qualified: 0, leads_sold: 0, revenue_cents: 0, leads_expired: 0, avg_score: null, avg_time_to_qualify_minutes: null },
    yesterday: { leads_received: 0, leads_qualified: 0, leads_sold: 0, revenue_cents: 0 },
    marketplace: { available_now: 0 },
    month: { revenue_cents: 0, last_month_revenue_cents: 0 },
    top_team_member: null,
    top_buyer: null,
    active_buyer_accounts: 0,
    pending_verifications: 0,
  };
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

async function countLeadsInRange(from: Date, to: Date): Promise<number> {
  const supabase = getServerSupabase();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", from.toISOString())
    .lt("created_at", to.toISOString());
  return count ?? 0;
}

async function countQualifiedInRange(from: Date, to: Date): Promise<number> {
  const supabase = getServerSupabase();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("qualified_at", from.toISOString())
    .lt("qualified_at", to.toISOString());
  return count ?? 0;
}

async function countSoldInRange(from: Date, to: Date): Promise<number> {
  const supabase = getServerSupabase();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .eq("status", "paid")
    .gte("purchased_at", from.toISOString())
    .lt("purchased_at", to.toISOString());
  return count ?? 0;
}

async function countExpiredInRange(from: Date, to: Date): Promise<number> {
  const supabase = getServerSupabase();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "expired")
    .gte("expired_at", from.toISOString())
    .lt("expired_at", to.toISOString());
  return count ?? 0;
}

async function countAvailableNow(): Promise<number> {
  const supabase = getServerSupabase();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "available");
  return count ?? 0;
}

async function sumRevenueInRange(from: Date, to: Date): Promise<number> {
  const supabase = getServerSupabase();
  if (!supabase) return 0;
  const { data } = await supabase
    .from("purchases")
    .select("amount_cents")
    .eq("status", "paid")
    .gte("purchased_at", from.toISOString())
    .lt("purchased_at", to.toISOString());
  return (data ?? []).reduce((sum, row) => sum + (Number(row.amount_cents) || 0), 0);
}

async function avgScoreInRange(from: Date, to: Date): Promise<number | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("leads")
    .select("score")
    .gte("qualified_at", from.toISOString())
    .lt("qualified_at", to.toISOString())
    .not("score", "is", null);
  if (!data || data.length === 0) return null;
  const sum = data.reduce((s, r) => s + Number(r.score), 0);
  return Math.round((sum / data.length) * 10) / 10;
}

async function avgTimeToQualifyMinutes(from: Date, to: Date): Promise<number | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("leads")
    .select("created_at, qualified_at")
    .gte("qualified_at", from.toISOString())
    .lt("qualified_at", to.toISOString());
  if (!data || data.length === 0) return null;
  let total = 0;
  let count = 0;
  for (const row of data) {
    if (!row.qualified_at || !row.created_at) continue;
    const diff = new Date(row.qualified_at as string).getTime() - new Date(row.created_at as string).getTime();
    total += diff / 60000;
    count += 1;
  }
  return count > 0 ? Math.round(total / count) : null;
}

async function topQualifier(from: Date, to: Date): Promise<{ name: string; qualifications: number } | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("leads")
    .select("assigned_qualifier_id")
    .gte("qualified_at", from.toISOString())
    .lt("qualified_at", to.toISOString())
    .not("assigned_qualifier_id", "is", null);
  if (!data || data.length === 0) return null;

  const counts: Record<string, number> = {};
  for (const r of data) {
    const id = r.assigned_qualifier_id as string;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  let topId = "";
  let topN = 0;
  for (const [id, n] of Object.entries(counts)) {
    if (n > topN) {
      topN = n;
      topId = id;
    }
  }
  if (!topId) return null;
  const { data: tm } = await supabase
    .from("team_members")
    .select("display_name")
    .eq("id", topId)
    .single();
  return { name: (tm?.display_name as string) ?? "—", qualifications: topN };
}

async function topBuyer(from: Date, to: Date): Promise<{ name: string; purchases: number } | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("purchases")
    .select("buyer_id")
    .eq("status", "paid")
    .gte("purchased_at", from.toISOString())
    .lt("purchased_at", to.toISOString());
  if (!data || data.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const r of data) {
    const id = r.buyer_id as string;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  let topId = "";
  let topN = 0;
  for (const [id, n] of Object.entries(counts)) {
    if (n > topN) {
      topN = n;
      topId = id;
    }
  }
  if (!topId) return null;
  const { data: b } = await supabase
    .from("buyer_accounts")
    .select("contact_name, business_name")
    .eq("id", topId)
    .single();
  const name = (b?.business_name as string) || (b?.contact_name as string) || "—";
  return { name, purchases: topN };
}

async function countPendingVerifications(): Promise<number> {
  const supabase = getServerSupabase();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("buyer_accounts")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending_verification");
  return count ?? 0;
}

async function countActiveBuyers(): Promise<number> {
  const supabase = getServerSupabase();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("buyer_accounts")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  return count ?? 0;
}
