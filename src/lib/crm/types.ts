// Shared type definitions for the CRM + buyer marketplace.
//
// These mirror the database enums and discrete-value columns. Keeping them
// in one place ensures app code, scoring, pricing, and email templates all
// agree on the exact set of legal values.

export type TeamRole =
  | "ceo"
  | "lead_qualifier"
  | "community_outreach"
  | "content_seo"
  | "bdr"
  | "platform_ops"
  | "hr";

export const TEAM_ROLES: readonly TeamRole[] = [
  "ceo",
  "lead_qualifier",
  "community_outreach",
  "content_seo",
  "bdr",
  "platform_ops",
  "hr",
] as const;

export const ROLE_LABEL: Record<TeamRole, string> = {
  ceo: "CEO",
  lead_qualifier: "Lead Qualifier",
  community_outreach: "Community Outreach Specialist",
  content_seo: "Content & SEO Specialist",
  bdr: "Business Development Rep",
  platform_ops: "Platform Operations Coordinator",
  hr: "HR",
};

export type LeadStatus =
  | "new"
  | "qualifying"
  | "qualified"
  | "available"
  | "sold"
  | "expired"
  | "unqualified"
  | "duplicate";

export type LeadTier = "hot" | "warm" | "standard";

export type BuyerKind = "dealer_master" | "dealer_sub" | "individual";

export type BuyerStatus =
  | "pending_verification"
  | "active"
  | "rejected"
  | "suspended";

export type PurchaseStatus =
  | "pending_payment"
  | "paid"
  | "failed"
  | "refunded_credit";

export type UnqualifiedReason =
  | "uncontactable"
  | "fake_information"
  | "not_serious_intent"
  | "outside_alberta"
  | "underage"
  | "duplicate_submission"
  | "other";

export const UNQUALIFIED_REASON_LABEL: Record<UnqualifiedReason, string> = {
  uncontactable: "Uncontactable (2+ attempts)",
  fake_information: "Fake or inconsistent information",
  not_serious_intent: "Not seriously buying",
  outside_alberta: "Outside Alberta",
  underage: "Under legal age",
  duplicate_submission: "Duplicate submission",
  other: "Other",
};

// =====================================================================
// Qualification checklist enums + labels.
// Every value matches the corresponding column in nw.lead_qualifications.
// =====================================================================

export type VisaStatus =
  | "citizen"
  | "permanent_resident"
  | "open_work_permit"
  | "lmia"
  | "pgwp"
  | "study_permit"
  | "refugee_claimant"
  | "other";

export const VISA_OPTIONS: { value: VisaStatus; label: string }[] = [
  { value: "citizen", label: "Citizen" },
  { value: "permanent_resident", label: "Permanent Resident" },
  { value: "open_work_permit", label: "Open Work Permit" },
  { value: "lmia", label: "LMIA Work Permit" },
  { value: "pgwp", label: "PGWP" },
  { value: "study_permit", label: "Study Permit" },
  { value: "refugee_claimant", label: "Refugee Claimant" },
  { value: "other", label: "Other" },
];

export type TimeInCanada = "under_1y" | "1_2y" | "2_5y" | "5y_plus";

export const TIME_IN_CANADA_OPTIONS: { value: TimeInCanada; label: string }[] = [
  { value: "under_1y", label: "Under 1 year" },
  { value: "1_2y", label: "1 to 2 years" },
  { value: "2_5y", label: "2 to 5 years" },
  { value: "5y_plus", label: "5 years or more" },
];

export type MonthlyIncome =
  | "under_2k"
  | "2k_3k"
  | "3k_4k"
  | "4k_5k"
  | "over_5k";

export const MONTHLY_INCOME_OPTIONS: { value: MonthlyIncome; label: string }[] = [
  { value: "under_2k", label: "Under $2k" },
  { value: "2k_3k", label: "$2k to $3k" },
  { value: "3k_4k", label: "$3k to $4k" },
  { value: "4k_5k", label: "$4k to $5k" },
  { value: "over_5k", label: "Over $5k" },
];

export type IncomeType =
  | "employed"
  | "self_employed"
  | "benefits"
  | "multiple";

export const INCOME_TYPE_OPTIONS: { value: IncomeType; label: string }[] = [
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-Employed" },
  { value: "benefits", label: "Government Benefits" },
  { value: "multiple", label: "Multiple Sources" },
];

export type TimeAtIncome = "under_6m" | "6m_1y" | "1y_2y" | "over_2y";

export const TIME_AT_INCOME_OPTIONS: { value: TimeAtIncome; label: string }[] = [
  { value: "under_6m", label: "Under 6 months" },
  { value: "6m_1y", label: "6 months to 1 year" },
  { value: "1y_2y", label: "1 to 2 years" },
  { value: "over_2y", label: "Over 2 years" },
];

export type MonthlyDebt = "none" | "under_500" | "500_1k" | "over_1k";

export const MONTHLY_DEBT_OPTIONS: { value: MonthlyDebt; label: string }[] = [
  { value: "none", label: "None" },
  { value: "under_500", label: "Under $500" },
  { value: "500_1k", label: "$500 to $1k" },
  { value: "over_1k", label: "Over $1k" },
];

export type CreditScore =
  | "under_500"
  | "500_580"
  | "580_650"
  | "650_plus"
  | "unknown";

export const CREDIT_SCORE_OPTIONS: { value: CreditScore; label: string }[] = [
  { value: "under_500", label: "Under 500" },
  { value: "500_580", label: "500 to 580" },
  { value: "580_650", label: "580 to 650" },
  { value: "650_plus", label: "650+" },
  { value: "unknown", label: "Unknown" },
];

export type CreditBracket = "poor" | "fair" | "good" | "unknown";

export type NewOrUsed = "new" | "used" | "either";

export const NEW_OR_USED_OPTIONS: { value: NewOrUsed; label: string }[] = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "either", label: "Either" },
];

export type BodyType = "suv" | "truck" | "sedan" | "minivan" | "any";

export const BODY_TYPE_OPTIONS: { value: BodyType; label: string }[] = [
  { value: "suv", label: "SUV" },
  { value: "truck", label: "Truck" },
  { value: "sedan", label: "Sedan" },
  { value: "minivan", label: "Minivan" },
  { value: "any", label: "Any" },
];

export type TotalBudget =
  | "under_15k"
  | "15_20"
  | "20_25"
  | "25_30"
  | "over_30";

export const TOTAL_BUDGET_OPTIONS: { value: TotalBudget; label: string }[] = [
  { value: "under_15k", label: "Under $15k" },
  { value: "15_20", label: "$15k to $20k" },
  { value: "20_25", label: "$20k to $25k" },
  { value: "25_30", label: "$25k to $30k" },
  { value: "over_30", label: "Over $30k" },
];

export type MonthlyPaymentTarget =
  | "under_300"
  | "300_400"
  | "400_500"
  | "over_500";

export const MONTHLY_PAYMENT_TARGET_OPTIONS: {
  value: MonthlyPaymentTarget;
  label: string;
}[] = [
  { value: "under_300", label: "Under $300" },
  { value: "300_400", label: "$300 to $400" },
  { value: "400_500", label: "$400 to $500" },
  { value: "over_500", label: "Over $500" },
];

export type DownPayment =
  | "none"
  | "under_1k"
  | "1_2k"
  | "2_5k"
  | "over_5k";

export const DOWN_PAYMENT_OPTIONS: { value: DownPayment; label: string }[] = [
  { value: "none", label: "None" },
  { value: "under_1k", label: "Under $1k" },
  { value: "1_2k", label: "$1k to $2k" },
  { value: "2_5k", label: "$2k to $5k" },
  { value: "over_5k", label: "Over $5k" },
];

export type PurchaseTimeline =
  | "asap"
  | "within_2_weeks"
  | "within_month"
  | "just_browsing";

export const PURCHASE_TIMELINE_OPTIONS: {
  value: PurchaseTimeline;
  label: string;
}[] = [
  { value: "asap", label: "ASAP" },
  { value: "within_2_weeks", label: "Within 2 weeks" },
  { value: "within_month", label: "Within a month" },
  { value: "just_browsing", label: "Just browsing" },
];

export type ContactTime = "morning" | "afternoon" | "evening";

export const CONTACT_TIME_OPTIONS: { value: ContactTime; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

export type Language =
  | "english"
  | "tagalog"
  | "punjabi"
  | "hindi"
  | "arabic"
  | "french"
  | "other";

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "english", label: "English" },
  { value: "tagalog", label: "Tagalog" },
  { value: "punjabi", label: "Punjabi" },
  { value: "hindi", label: "Hindi" },
  { value: "arabic", label: "Arabic" },
  { value: "french", label: "French" },
  { value: "other", label: "Other" },
];

// =====================================================================
// Unified qualification payload (server-side validated, app + tests share it)
// =====================================================================

export type QualificationPayload = {
  visa_status: VisaStatus;
  time_in_canada: TimeInCanada;
  has_ab_licence: boolean;

  monthly_income: MonthlyIncome;
  income_type: IncomeType;
  time_at_income: TimeAtIncome;
  monthly_debt: MonthlyDebt;

  credit_score: CreditScore;
  active_bankruptcy: boolean;
  discharged_bankruptcy: boolean;
  active_consumer_proposal: boolean;
  declined_last_6mo: boolean;
  outstanding_collections: boolean;

  new_or_used: NewOrUsed;
  body_type: BodyType;
  total_budget: TotalBudget;
  monthly_payment_target: MonthlyPaymentTarget;
  down_payment: DownPayment;
  trade_in: boolean;
  purchase_timeline: PurchaseTimeline;

  preferred_contact_time: ContactTime;
  preferred_language: Language;

  notes?: string | null;
};

// Buyer-facing filter values.
export type BuyerFilter = {
  tier?: LeadTier | "all";
  body_type?: BodyType[];
  visa_status?: VisaStatus[];
  total_budget?: TotalBudget[];
  down_payment?: DownPayment[];
  purchase_timeline?: PurchaseTimeline[];
  credit_bracket?: CreditBracket[];
};

// "Cookie session" subject shape — never trust the cookie blindly. Always
// re-read sessions table after parsing.
export type SessionSubject =
  | { kind: "team"; team_member_id: string; role: TeamRole }
  | { kind: "buyer"; buyer_account_id: string; buyer_kind: BuyerKind };
