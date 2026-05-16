// Build the buyer-facing one-line "situation summary" from a qualification
// payload. Pure function — used both for storing in DB and for marketplace
// rendering. Never reveals PII or score, just the qualification signal.

import type { QualificationPayload } from "./types";

type LeadMeta = {
  firstName?: string | null;
  neighbourhood?: string | null;
};

export function buildSituationSummary(
  q: QualificationPayload,
  _meta?: LeadMeta,
): string {
  const incomeType = labelIncomeType(q.income_type);
  const visa = labelVisa(q.visa_status);
  const credit = labelCreditBracket(q.credit_score);

  const body = labelBody(q.body_type);
  const newOrUsed = labelNewOrUsed(q.new_or_used);
  const budget = labelBudget(q.total_budget);

  const down = labelDown(q.down_payment);
  const timeline = labelTimeline(q.purchase_timeline);

  const parts: string[] = [];
  parts.push(incomeType);
  parts.push(visa);
  parts.push(`${credit} credit`);
  parts.push(`looking for ${body} ${newOrUsed} under ${budget}`);
  parts.push(down ? `${down} down payment available` : "no down payment");
  parts.push(`timeline ${timeline}`);
  if (_meta?.neighbourhood) parts.push(_meta.neighbourhood);

  return capitalizeFirst(parts.filter(Boolean).join(", "));
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

function labelIncomeType(v: QualificationPayload["income_type"]): string {
  switch (v) {
    case "employed":      return "employed";
    case "self_employed": return "self-employed";
    case "benefits":      return "on government benefits";
    case "multiple":      return "multiple income sources";
  }
}

function labelVisa(v: QualificationPayload["visa_status"]): string {
  switch (v) {
    case "citizen":            return "Canadian citizen";
    case "permanent_resident": return "permanent resident";
    case "open_work_permit":   return "open work permit";
    case "lmia":               return "LMIA work permit";
    case "pgwp":               return "PGWP";
    case "study_permit":       return "study permit";
    case "refugee_claimant":   return "refugee claimant";
    case "other":              return "other status";
  }
}

// Spec says the buyer-facing credit label is "poor / fair / good" derived
// from the score, but the situation summary string uses the same word —
// good for filtering. Here we map from the credit_score bracket directly
// (not the score), since this string is built when storing the summary.
function labelCreditBracket(v: QualificationPayload["credit_score"]): string {
  switch (v) {
    case "650_plus":  return "good";
    case "580_650": return "fair";
    case "500_580": return "fair";
    case "under_500": return "poor";
    case "unknown":   return "unknown";
  }
}

function labelBody(v: QualificationPayload["body_type"]): string {
  switch (v) {
    case "suv":     return "SUV";
    case "truck":   return "truck";
    case "sedan":   return "sedan";
    case "minivan": return "minivan";
    case "any":     return "any body type";
  }
}

function labelNewOrUsed(v: QualificationPayload["new_or_used"]): string {
  switch (v) {
    case "new":    return "new";
    case "used":   return "used";
    case "either": return "either new or used";
  }
}

function labelBudget(v: QualificationPayload["total_budget"]): string {
  switch (v) {
    case "under_15k": return "$15k";
    case "15_20":     return "$20k";
    case "20_25":     return "$25k";
    case "25_30":     return "$30k";
    case "over_30":   return "over $30k";
  }
}

function labelDown(v: QualificationPayload["down_payment"]): string {
  switch (v) {
    case "none":     return "";
    case "under_1k": return "under $1k";
    case "1_2k":     return "$1–2k";
    case "2_5k":     return "$2–5k";
    case "over_5k":  return "$5k+";
  }
}

function labelTimeline(v: QualificationPayload["purchase_timeline"]): string {
  switch (v) {
    case "asap":           return "ASAP";
    case "within_2_weeks": return "within 2 weeks";
    case "within_month":   return "within a month";
    case "just_browsing":  return "just browsing";
  }
}
