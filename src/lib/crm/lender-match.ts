// Lender match intelligence — pure rule engine, no external API.
//
// Runs immediately after scoring on every qualified lead. Maps qualification
// data to recommended lenders based on pre-defined rules.

import type { QualificationPayload } from "./types";

export type LenderRecommendation = {
  lender: string;
  reason: string;
};

export function matchLenders(q: QualificationPayload): LenderRecommendation[] {
  const matches: LenderRecommendation[] = [];

  // Rifco: credit under 580, self-employed, discharged bankruptcy, consumer proposal
  if (
    q.credit_score === "under_500" ||
    q.credit_score === "500_580" ||
    q.income_type === "self_employed" ||
    q.discharged_bankruptcy ||
    q.active_consumer_proposal
  ) {
    matches.push({
      lender: "Rifco",
      reason: "Specializes in non-prime credit, self-employed, and post-insolvency applicants",
    });
  }

  // Westlake: newcomer with work permit, unknown credit score, income under $3k
  if (
    (q.visa_status === "open_work_permit" ||
      q.visa_status === "lmia" ||
      q.visa_status === "pgwp") ||
    q.credit_score === "unknown" ||
    q.monthly_income === "under_2k" ||
    q.monthly_income === "2k_3k"
  ) {
    matches.push({
      lender: "Westlake",
      reason: "Newcomer-friendly, accepts thin or unknown credit files and work-permit holders",
    });
  }

  // NCF: credit 580+, stable employment, down payment available
  if (
    (q.credit_score === "580_650" || q.credit_score === "650_plus") &&
    (q.income_type === "employed" || q.income_type === "multiple") &&
    q.down_payment !== "none"
  ) {
    matches.push({
      lender: "NCF",
      reason: "Near-prime lender for applicants with 580+ credit, stable income, and down payment",
    });
  }

  // Equitable: active consumer proposal with income over $3k
  if (
    q.active_consumer_proposal &&
    (q.monthly_income === "3k_4k" ||
      q.monthly_income === "4k_5k" ||
      q.monthly_income === "over_5k")
  ) {
    matches.push({
      lender: "Equitable",
      reason: "Works with active consumer proposals when income exceeds $3k/month",
    });
  }

  return matches;
}
