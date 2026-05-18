"use client";

import { useCallback, useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VisaStatus =
  | "citizen"
  | "permanent_resident"
  | "open_work_permit"
  | "lmia"
  | "pgwp"
  | "study_permit"
  | "refugee_claimant"
  | "other";

export type QualificationFormData = {
  // Vehicle
  new_or_used: "new" | "used" | "either" | null;
  body_type: "suv" | "truck" | "sedan" | "minivan" | "any" | null;
  total_budget: "under_15k" | "15_20" | "20_25" | "25_30" | "over_30" | null;
  monthly_payment_target: "under_300" | "300_400" | "400_500" | "over_500" | null;
  down_payment: "none" | "under_1k" | "1_2k" | "2_5k" | "over_5k" | null;
  trade_in: boolean | null;
  purchase_timeline: "asap" | "within_2_weeks" | "within_month" | "just_browsing" | null;
  // Identity
  visa_status: VisaStatus | null;
  time_in_canada: "under_1y" | "1_2y" | "2_5y" | "5y_plus" | null;
  has_ab_licence: boolean | null;
  // Financial
  monthly_income: "under_2k" | "2k_3k" | "3k_4k" | "4k_5k" | "over_5k" | null;
  income_type: "employed" | "self_employed" | "benefits" | "multiple" | null;
  time_at_income: "under_6m" | "6m_1y" | "1y_2y" | "over_2y" | null;
  monthly_debt: "none" | "under_500" | "500_1k" | "over_1k" | null;
  // Credit
  credit_score: "under_500" | "500_580" | "580_650" | "650_plus" | "unknown" | null;
  active_bankruptcy: boolean | null;
  active_consumer_proposal: boolean | null;
  // Logistics
  preferred_contact_time: "morning" | "afternoon" | "evening" | null;
  preferred_language: "english" | "tagalog" | "punjabi" | "hindi" | "arabic" | "french" | "other" | null;
};

type StepConfig = {
  id: string;
  title: string;
  subtitle?: string;
  helper?: string;
  field: keyof QualificationFormData;
  options: { value: string; label: string; emoji?: string }[];
  condition?: (data: QualificationFormData) => boolean;
};

// ---------------------------------------------------------------------------
// Step definitions — Canada Drives style, one question per screen
// ---------------------------------------------------------------------------

const STEPS: StepConfig[] = [
  {
    id: "body_type",
    title: "What kind of vehicle are you looking for?",
    subtitle: "Pick the style that fits your life",
    field: "body_type",
    options: [
      { value: "suv", label: "SUV / Crossover", emoji: "🚙" },
      { value: "truck", label: "Truck", emoji: "🛻" },
      { value: "sedan", label: "Sedan", emoji: "🚗" },
      { value: "minivan", label: "Minivan", emoji: "🚐" },
      { value: "any", label: "I'm flexible", emoji: "✨" },
    ],
  },
  {
    id: "new_or_used",
    title: "New or used?",
    subtitle: "Both are great — used saves you money, new gets warranties",
    field: "new_or_used",
    options: [
      { value: "used", label: "Used — save money", emoji: "💰" },
      { value: "new", label: "Brand new", emoji: "✨" },
      { value: "either", label: "Either works", emoji: "👍" },
    ],
  },
  {
    id: "monthly_payment_target",
    title: "What monthly payment works for you?",
    subtitle: "This helps us find vehicles in your comfort zone",
    field: "monthly_payment_target",
    options: [
      { value: "under_300", label: "Under $300/mo" },
      { value: "300_400", label: "$300 – $400/mo" },
      { value: "400_500", label: "$400 – $500/mo" },
      { value: "over_500", label: "$500+/mo" },
    ],
  },
  {
    id: "down_payment",
    title: "Do you have a down payment?",
    subtitle: "No worries if not — $0 down is possible",
    field: "down_payment",
    options: [
      { value: "none", label: "No down payment" },
      { value: "under_1k", label: "Under $1,000" },
      { value: "1_2k", label: "$1,000 – $2,000" },
      { value: "2_5k", label: "$2,000 – $5,000" },
      { value: "over_5k", label: "$5,000+" },
    ],
  },
  {
    id: "trade_in",
    title: "Do you have a trade-in?",
    field: "trade_in",
    options: [
      { value: "true", label: "Yes, I have a trade-in" },
      { value: "false", label: "No trade-in" },
    ],
  },
  {
    id: "purchase_timeline",
    title: "When do you need a vehicle?",
    subtitle: "Faster timelines = faster we move for you",
    field: "purchase_timeline",
    options: [
      { value: "asap", label: "ASAP — need it now", emoji: "🔥" },
      { value: "within_2_weeks", label: "Within 2 weeks" },
      { value: "within_month", label: "Within a month" },
      { value: "just_browsing", label: "Just exploring" },
    ],
  },
  {
    id: "visa_status",
    title: "What's your residency status?",
    subtitle: "We help everyone — newcomers, citizens, all of it",
    field: "visa_status",
    options: [
      { value: "citizen", label: "Canadian citizen", emoji: "🇨🇦" },
      { value: "permanent_resident", label: "Permanent resident" },
      { value: "open_work_permit", label: "Open work permit" },
      { value: "lmia", label: "LMIA work permit" },
      { value: "pgwp", label: "Post-grad work permit (PGWP)" },
      { value: "study_permit", label: "Study permit" },
      { value: "refugee_claimant", label: "Refugee claimant" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "time_in_canada",
    title: "How long have you been in Canada?",
    field: "time_in_canada",
    condition: (d) =>
      d.visa_status !== null &&
      d.visa_status !== "citizen",
    options: [
      { value: "under_1y", label: "Less than 1 year" },
      { value: "1_2y", label: "1 – 2 years" },
      { value: "2_5y", label: "2 – 5 years" },
      { value: "5y_plus", label: "5+ years" },
    ],
  },
  {
    id: "has_ab_licence",
    title: "Do you have an Alberta driver's licence?",
    field: "has_ab_licence",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "Not yet" },
    ],
  },
  {
    id: "income_type",
    title: "What's your employment situation?",
    subtitle: "Your income source helps us match you with the right lender",
    field: "income_type",
    options: [
      { value: "employed", label: "Employed (full-time / part-time)", emoji: "💼" },
      { value: "self_employed", label: "Self-employed / Business owner", emoji: "🏢" },
      { value: "benefits", label: "Benefits / Disability / Pension", emoji: "🛡️" },
      { value: "multiple", label: "Multiple income sources", emoji: "📊" },
    ],
  },
  {
    id: "monthly_income",
    title: "What's your monthly income (before tax)?",
    subtitle: "Approximate is fine — helps us figure out affordability",
    field: "monthly_income",
    options: [
      { value: "under_2k", label: "Under $2,000/mo" },
      { value: "2k_3k", label: "$2,000 – $3,000/mo" },
      { value: "3k_4k", label: "$3,000 – $4,000/mo" },
      { value: "4k_5k", label: "$4,000 – $5,000/mo" },
      { value: "over_5k", label: "$5,000+/mo" },
    ],
  },
  {
    id: "time_at_income",
    title: "How long have you been earning this income?",
    field: "time_at_income",
    options: [
      { value: "under_6m", label: "Less than 6 months" },
      { value: "6m_1y", label: "6 months – 1 year" },
      { value: "1y_2y", label: "1 – 2 years" },
      { value: "over_2y", label: "2+ years" },
    ],
  },
  {
    id: "monthly_debt",
    title: "How much do you pay in monthly debts?",
    subtitle: "Include car loans, credit cards, personal loans — not rent",
    field: "monthly_debt",
    options: [
      { value: "none", label: "No debt payments", emoji: "🎉" },
      { value: "under_500", label: "Under $500/mo" },
      { value: "500_1k", label: "$500 – $1,000/mo" },
      { value: "over_1k", label: "Over $1,000/mo" },
    ],
  },
  {
    id: "credit_score",
    title: "How would you describe your credit?",
    subtitle: "Don't worry — we work with all credit levels",
    field: "credit_score",
    options: [
      { value: "650_plus", label: "Good (650+)", emoji: "💚" },
      { value: "580_650", label: "Fair (580–650)", emoji: "👍" },
      { value: "500_580", label: "Rebuilding (500–580)", emoji: "🔧" },
      { value: "under_500", label: "Rough (under 500)", emoji: "💪" },
      { value: "unknown", label: "I'm not sure" },
    ],
  },
  {
    id: "active_bankruptcy",
    title: "Are you currently in an active bankruptcy?",
    field: "active_bankruptcy",
    options: [
      { value: "false", label: "No" },
      { value: "true", label: "Yes — active bankruptcy" },
    ],
  },
  {
    id: "active_consumer_proposal",
    title: "Are you in a consumer proposal?",
    field: "active_consumer_proposal",
    options: [
      { value: "false", label: "No" },
      { value: "true", label: "Yes — consumer proposal" },
    ],
  },
  {
    id: "preferred_language",
    title: "What language do you prefer?",
    field: "preferred_language",
    options: [
      { value: "english", label: "English" },
      { value: "french", label: "French" },
      { value: "punjabi", label: "Punjabi" },
      { value: "hindi", label: "Hindi" },
      { value: "tagalog", label: "Tagalog" },
      { value: "arabic", label: "Arabic" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "preferred_contact_time",
    title: "Best time for us to reach you?",
    subtitle: "We'll call to finalize your application",
    field: "preferred_contact_time",
    options: [
      { value: "morning", label: "Morning (9–12)", emoji: "☀️" },
      { value: "afternoon", label: "Afternoon (12–5)", emoji: "🌤️" },
      { value: "evening", label: "Evening (5–8)", emoji: "🌙" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

function initialFormData(): QualificationFormData {
  return {
    new_or_used: null,
    body_type: null,
    total_budget: null,
    monthly_payment_target: null,
    down_payment: null,
    trade_in: null,
    purchase_timeline: null,
    visa_status: null,
    time_in_canada: null,
    has_ab_licence: null,
    monthly_income: null,
    income_type: null,
    time_at_income: null,
    monthly_debt: null,
    credit_score: null,
    active_bankruptcy: null,
    active_consumer_proposal: null,
    preferred_contact_time: null,
    preferred_language: null,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  token: string;
  firstName: string;
  onComplete: () => void;
};

export function QualificationWizard({ token, firstName, onComplete }: Props) {
  const [data, setData] = useState<QualificationFormData>(initialFormData);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSteps = useMemo(
    () => STEPS.filter((s) => !s.condition || s.condition(data)),
    [data],
  );

  const currentStep = activeSteps[stepIndex] ?? null;
  const totalSteps = activeSteps.length;
  const progress = totalSteps > 0 ? ((stepIndex) / totalSteps) * 100 : 0;

  const currentValue = currentStep ? data[currentStep.field] : null;

  const selectOption = useCallback(
    (value: string) => {
      if (!currentStep) return;
      const field = currentStep.field;
      let parsed: string | boolean = value;
      if (value === "true") parsed = true;
      if (value === "false") parsed = false;
      setData((prev) => ({ ...prev, [field]: parsed }));
    },
    [currentStep],
  );

  const submitQualification = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...data,
        total_budget: data.total_budget ?? mapBudgetFromPayment(data.monthly_payment_target),
        time_in_canada: data.time_in_canada ?? (data.visa_status === "citizen" ? "5y_plus" : null),
        discharged_bankruptcy: false,
        declined_last_6mo: false,
        outstanding_collections: false,
      };
      const res = await fetch(`/api/apply/${encodeURIComponent(token)}/qualify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      onComplete();
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }, [data, token, onComplete]);

  const goNext = useCallback(async () => {
    if (currentValue === null) return;
    if (stepIndex < totalSteps - 1) {
      setStepIndex((i) => i + 1);
    } else {
      await submitQualification();
    }
  }, [currentValue, stepIndex, totalSteps, submitQualification]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }, [stepIndex]);

  if (!currentStep) return null;

  const isLast = stepIndex === totalSteps - 1;
  const valueStr = typeof currentValue === "boolean" ? String(currentValue) : (currentValue ?? "");

  return (
    <div className="flex min-h-[100dvh] flex-col bg-brand-creamSoft">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-brand-creamSoft/95 backdrop-blur-sm px-4 pt-4 pb-2">
        <div className="mx-auto max-w-lg">
          <div className="h-2 w-full rounded-full bg-brand-line overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-brand-muted">
            {stepIndex + 1} of {totalSteps} — takes about 2 minutes
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Greeting on first step */}
          {stepIndex === 0 && (
            <p className="text-center text-sm font-semibold text-brand-forest">
              Hey {firstName} — let&apos;s find your next ride
            </p>
          )}

          {/* Question */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight text-brand-ink sm:text-2xl">
              {currentStep.title}
            </h2>
            {currentStep.subtitle && (
              <p className="text-sm text-brand-muted">{currentStep.subtitle}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentStep.options.map((opt) => {
              const selected = valueStr === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectOption(opt.value)}
                  className={`
                    w-full rounded-2xl px-5 py-4 text-left text-sm font-semibold
                    transition-all duration-150
                    ring-1 ring-inset
                    ${
                      selected
                        ? "bg-brand-primary text-white ring-brand-primary shadow-glow"
                        : "bg-white text-brand-ink ring-brand-line hover:ring-brand-forest/40 hover:shadow-card"
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    {opt.emoji && <span className="text-lg">{opt.emoji}</span>}
                    <span>{opt.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3 pt-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl border border-brand-line px-5 py-3 text-sm font-semibold text-brand-ink hover:bg-brand-cream transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              disabled={currentValue === null || submitting}
              className={`
                flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-all
                ${
                  currentValue !== null && !submitting
                    ? "bg-brand-accent text-brand-ink hover:bg-brand-accentSoft shadow-card"
                    : "bg-brand-line text-brand-muted cursor-not-allowed"
                }
              `}
            >
              {submitting ? "Submitting..." : isLast ? "Complete application" : "Continue"}
            </button>
          </div>

          {/* Helper text */}
          {currentStep.helper && (
            <p className="text-center text-xs text-brand-muted">{currentStep.helper}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-6 text-center">
        <p className="text-xs text-brand-muted">
          Your data is encrypted and protected under PIPEDA.
        </p>
      </div>
    </div>
  );
}

// Map monthly payment to approximate total budget
function mapBudgetFromPayment(payment: string | null): string {
  switch (payment) {
    case "under_300": return "under_15k";
    case "300_400": return "15_20";
    case "400_500": return "20_25";
    case "over_500": return "over_30";
    default: return "20_25";
  }
}
