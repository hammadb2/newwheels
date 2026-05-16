// Lead scoring algorithm. Pure function — no I/O, no env vars.
//
// Score is 0..100. Floor is 0; cannot go negative. Tier is derived from the
// final score: 75+ = hot, 50–74 = warm, < 50 = standard.
//
// Lead Qualifier never sees the score — UI must not echo it back. This module
// is invoked server-side only, immediately after a qualification submission.

import type { LeadTier, QualificationPayload } from "./types";

export type ScoreResult = {
  score: number;          // 0..100
  tier: LeadTier;         // hot | warm | standard
  positive: number;       // sum of positive points (pre-floor)
  negative: number;       // sum of negative points (pre-floor; positive number)
  breakdown: Record<string, number>;  // contribution by field
};

export function scoreLead(q: QualificationPayload): ScoreResult {
  const breakdown: Record<string, number> = {};
  const add = (key: string, value: number) => {
    if (value === 0) return;
    breakdown[key] = (breakdown[key] ?? 0) + value;
  };

  // Positive scoring ────────────────────────────────────────────────

  switch (q.monthly_income) {
    case "over_5k": add("monthly_income", 20); break;
    case "4k_5k":   add("monthly_income", 15); break;
    case "3k_4k":   add("monthly_income", 10); break;
    case "2k_3k":   add("monthly_income", 5);  break;
    case "under_2k":                            break;
  }

  switch (q.down_payment) {
    case "over_5k":  add("down_payment", 15); break;
    case "2_5k":     add("down_payment", 10); break;
    case "1_2k":     add("down_payment", 5);  break;
    case "under_1k": add("down_payment", 2);  break;
    case "none":                              break;
  }

  switch (q.credit_score) {
    case "650_plus": add("credit_score", 15); break;
    case "580_650": add("credit_score", 10); break;
    case "500_580": add("credit_score", 5);  break;
    case "unknown": add("credit_score", 2);  break;
    case "under_500":                         break;
  }

  switch (q.time_in_canada) {
    case "5y_plus":  add("time_in_canada", 10); break;
    case "2_5y":     add("time_in_canada", 7);  break;
    case "1_2y":     add("time_in_canada", 4);  break;
    case "under_1y":                             break;
  }

  if (q.has_ab_licence) add("has_ab_licence", 10);

  if (!q.active_bankruptcy && !q.active_consumer_proposal) {
    add("no_active_bk_or_cp", 10);
  } else if (q.active_bankruptcy && q.active_consumer_proposal) {
    add("both_active_bk_and_cp", 0);
  } else {
    add("one_active_bk_or_cp", 5);
  }

  if (!q.declined_last_6mo) add("no_recent_declines", 8);

  switch (q.purchase_timeline) {
    case "asap":           add("purchase_timeline", 7); break;
    case "within_2_weeks": add("purchase_timeline", 5); break;
    case "within_month":   add("purchase_timeline", 2); break;
    case "just_browsing":                                break;
  }

  if (q.trade_in) add("trade_in", 5);

  const positive = sumPositive(breakdown);

  // Negative scoring ────────────────────────────────────────────────

  if (q.active_bankruptcy) add("penalty_active_bankruptcy", -20);
  if (q.active_consumer_proposal) add("penalty_active_consumer_proposal", -15);
  if (q.declined_last_6mo) add("penalty_declined_last_6mo", -10);
  if (q.outstanding_collections) add("penalty_outstanding_collections", -10);
  if (q.monthly_debt === "over_1k") add("penalty_high_debt", -8);

  // "Income under $2k with no down payment"
  if (q.monthly_income === "under_2k" && q.down_payment === "none") {
    add("penalty_low_income_no_down", -10);
  }

  // "Just browsing with no down payment and income under $2k"
  if (
    q.purchase_timeline === "just_browsing" &&
    q.down_payment === "none" &&
    q.monthly_income === "under_2k"
  ) {
    add("penalty_browsing_no_down_low_income", -15);
  }

  const negativeRaw = sumNegativeAbs(breakdown);
  const score = clamp(Math.round(positive - negativeRaw), 0, 100);
  const tier: LeadTier = score >= 75 ? "hot" : score >= 50 ? "warm" : "standard";

  return { score, tier, positive, negative: negativeRaw, breakdown };
}

function sumPositive(b: Record<string, number>): number {
  let s = 0;
  for (const v of Object.values(b)) if (v > 0) s += v;
  return s;
}

function sumNegativeAbs(b: Record<string, number>): number {
  let s = 0;
  for (const v of Object.values(b)) if (v < 0) s += -v;
  return s;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// =====================================================================
// Credit bracket derivation (buyer-visible label) — derived ONLY from score
// per the spec, NOT from the underlying credit_score field. This keeps the
// buyer view consistent with the tier signal we sell on.
// =====================================================================

export function creditBracketFromScore(score: number | null | undefined): "poor" | "fair" | "good" | "unknown" {
  if (score === null || score === undefined) return "unknown";
  if (score >= 75) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

// Convenience tier helpers ──────────────────────────────────────────

export function tierFromScore(score: number): LeadTier {
  if (score >= 75) return "hot";
  if (score >= 50) return "warm";
  return "standard";
}

export function startingPriceCentsForTier(tier: LeadTier, verified = false): number {
  // Spec: Hot $200, Warm $150, Standard $100.
  // Verified leads add $100–$200 to the starting price regardless of tier;
  // we apply the maximum bump on hot ($200) and the minimum on standard ($100)
  // so verified hot starts at $400 and verified standard at $200, matching
  // the spec's "Verified leads start at $300 to $400" anchor.
  const base = (() => {
    switch (tier) {
      case "hot":      return 20000;
      case "warm":     return 15000;
      case "standard": return 10000;
    }
  })();
  return verified ? base + VERIFIED_PREMIUM_CENTS[tier] : base;
}

// Verified-lead starting-price premium per tier. Centralised here (rather
// than baked into pricing.ts) so the scoring/pricing audit in PRs can read
// a single source of truth.
export const VERIFIED_PREMIUM_CENTS: Record<LeadTier, number> = {
  hot: 20000,      // +$200 → verified hot starts at $400
  warm: 15000,    // +$150 → verified warm starts at $300
  standard: 10000, // +$100 → verified standard starts at $200
};
