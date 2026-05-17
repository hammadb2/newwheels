// Community referral engine.
//
// - referral_token on leads table
// - /r/[token] route handler redirects to main site with ref param
// - Referral link embedded in confirmation email
// - When referred lead sells, Platform Ops gets task notification
// - Referral chain and revenue tracked in CEO dashboard

import { getServerSupabase } from "./supabase/server";
import { randomBytes } from "node:crypto";

export function generateReferralToken(): string {
  return randomBytes(8).toString("hex");
}

export async function resolveReferralToken(token: string): Promise<{
  lead_id: string;
  first_name: string;
} | null> {
  const supabase = getServerSupabase();
  if (!supabase || !token) return null;

  const { data } = await supabase
    .from("leads")
    .select("id, first_name")
    .eq("referral_token", token)
    .maybeSingle();

  if (!data) return null;
  return { lead_id: data.id as string, first_name: data.first_name as string };
}

export async function getReferralStats(): Promise<{
  total_referrals: number;
  referral_sales: number;
  referral_revenue_cents: number;
  pending_rewards: number;
  top_referrers: { lead_id: string; first_name: string; referral_count: number }[];
}> {
  const supabase = getServerSupabase();
  if (!supabase) {
    return { total_referrals: 0, referral_sales: 0, referral_revenue_cents: 0, pending_rewards: 0, top_referrers: [] };
  }

  // Count total referrals
  const { count: totalReferrals } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .not("referred_by", "is", null);

  // Count referral sales and revenue
  const { data: sales } = await supabase
    .from("purchases")
    .select("id, amount_cents, lead_id")
    .eq("status", "paid");

  let referralSales = 0;
  let referralRevenue = 0;

  if (sales) {
    const leadIds = sales.map((s) => s.lead_id as string);
    if (leadIds.length > 0) {
      const { data: referredLeads } = await supabase
        .from("leads")
        .select("id")
        .in("id", leadIds)
        .not("referred_by", "is", null);

      const referredSet = new Set((referredLeads ?? []).map((l) => l.id as string));
      for (const sale of sales) {
        if (referredSet.has(sale.lead_id as string)) {
          referralSales++;
          referralRevenue += (sale.amount_cents as number) ?? 0;
        }
      }
    }
  }

  // Pending rewards
  const { count: pendingRewards } = await supabase
    .from("referral_rewards")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return {
    total_referrals: totalReferrals ?? 0,
    referral_sales: referralSales,
    referral_revenue_cents: referralRevenue,
    pending_rewards: pendingRewards ?? 0,
    top_referrers: [],
  };
}
