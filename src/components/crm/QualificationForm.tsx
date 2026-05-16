"use client";

// Full qualification checklist. Every field is a dropdown / boolean toggle /
// predefined range so the Lead Qualifier never types free-form data (except
// the optional 300-char notes field). Score is computed server-side and
// never echoed back to this form.

import { useState } from "react";
import {
  BODY_TYPE_OPTIONS,
  CONTACT_TIME_OPTIONS,
  CREDIT_SCORE_OPTIONS,
  DOWN_PAYMENT_OPTIONS,
  INCOME_TYPE_OPTIONS,
  LANGUAGE_OPTIONS,
  MONTHLY_DEBT_OPTIONS,
  MONTHLY_INCOME_OPTIONS,
  MONTHLY_PAYMENT_TARGET_OPTIONS,
  NEW_OR_USED_OPTIONS,
  PURCHASE_TIMELINE_OPTIONS,
  TIME_AT_INCOME_OPTIONS,
  TIME_IN_CANADA_OPTIONS,
  TOTAL_BUDGET_OPTIONS,
  UNQUALIFIED_REASON_LABEL,
  VISA_OPTIONS,
} from "@/lib/crm/types";
import type { UnqualifiedReason } from "@/lib/crm/types";

type FormState = {
  visa_status: string;
  time_in_canada: string;
  has_ab_licence: string;

  monthly_income: string;
  income_type: string;
  time_at_income: string;
  monthly_debt: string;

  credit_score: string;
  active_bankruptcy: string;
  discharged_bankruptcy: string;
  active_consumer_proposal: string;
  declined_last_6mo: string;
  outstanding_collections: string;

  new_or_used: string;
  body_type: string;
  total_budget: string;
  monthly_payment_target: string;
  down_payment: string;
  trade_in: string;
  purchase_timeline: string;

  preferred_contact_time: string;
  preferred_language: string;

  notes: string;
};

const INITIAL: FormState = {
  visa_status: "",
  time_in_canada: "",
  has_ab_licence: "",
  monthly_income: "",
  income_type: "",
  time_at_income: "",
  monthly_debt: "",
  credit_score: "",
  active_bankruptcy: "",
  discharged_bankruptcy: "",
  active_consumer_proposal: "",
  declined_last_6mo: "",
  outstanding_collections: "",
  new_or_used: "",
  body_type: "",
  total_budget: "",
  monthly_payment_target: "",
  down_payment: "",
  trade_in: "",
  purchase_timeline: "",
  preferred_contact_time: "",
  preferred_language: "",
  notes: "",
};

const UNQUAL_REASONS = Object.keys(UNQUALIFIED_REASON_LABEL) as UnqualifiedReason[];

export function QualificationForm({ leadId }: { leadId: string }) {
  const [v, setV] = useState<FormState>(INITIAL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showUnqual, setShowUnqual] = useState(false);
  const [unqualReason, setUnqualReason] = useState<UnqualifiedReason>("uncontactable");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setV((s) => ({ ...s, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = {
        action: "qualify" as const,
        visa_status: v.visa_status,
        time_in_canada: v.time_in_canada,
        has_ab_licence: v.has_ab_licence === "yes",
        monthly_income: v.monthly_income,
        income_type: v.income_type,
        time_at_income: v.time_at_income,
        monthly_debt: v.monthly_debt,
        credit_score: v.credit_score,
        active_bankruptcy: v.active_bankruptcy === "yes",
        discharged_bankruptcy: v.discharged_bankruptcy === "yes",
        active_consumer_proposal: v.active_consumer_proposal === "yes",
        declined_last_6mo: v.declined_last_6mo === "yes",
        outstanding_collections: v.outstanding_collections === "yes",
        new_or_used: v.new_or_used,
        body_type: v.body_type,
        total_budget: v.total_budget,
        monthly_payment_target: v.monthly_payment_target,
        down_payment: v.down_payment,
        trade_in: v.trade_in === "yes",
        purchase_timeline: v.purchase_timeline,
        preferred_contact_time: v.preferred_contact_time,
        preferred_language: v.preferred_language,
        notes: v.notes.trim() ? v.notes.slice(0, 300) : null,
      };
      const res = await fetch(`/api/crm/leads/${leadId}/qualify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Submission failed");
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  async function submitUnqualified() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/qualify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unqualify", reason: unqualReason }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Submission failed");
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-4 text-sm text-green-900">
        Submitted. Refresh to see the updated lead status.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <Section title="Identity &amp; status">
        <Select label="Visa or residency status" value={v.visa_status} options={VISA_OPTIONS} onChange={(x) => set("visa_status", x)} required />
        <Select label="Time in Canada" value={v.time_in_canada} options={TIME_IN_CANADA_OPTIONS} onChange={(x) => set("time_in_canada", x)} required />
        <YesNo label="Valid Alberta driver's licence" value={v.has_ab_licence} onChange={(x) => set("has_ab_licence", x)} />
      </Section>

      <Section title="Financial picture">
        <Select label="Monthly income" value={v.monthly_income} options={MONTHLY_INCOME_OPTIONS} onChange={(x) => set("monthly_income", x)} required />
        <Select label="Income type" value={v.income_type} options={INCOME_TYPE_OPTIONS} onChange={(x) => set("income_type", x)} required />
        <Select label="Time at current income source" value={v.time_at_income} options={TIME_AT_INCOME_OPTIONS} onChange={(x) => set("time_at_income", x)} required />
        <Select label="Monthly debt payments" value={v.monthly_debt} options={MONTHLY_DEBT_OPTIONS} onChange={(x) => set("monthly_debt", x)} required />
      </Section>

      <Section title="Credit">
        <Select label="Approximate credit score" value={v.credit_score} options={CREDIT_SCORE_OPTIONS} onChange={(x) => set("credit_score", x)} required />
        <YesNo label="Active bankruptcy" value={v.active_bankruptcy} onChange={(x) => set("active_bankruptcy", x)} />
        <YesNo label="Discharged bankruptcy" value={v.discharged_bankruptcy} onChange={(x) => set("discharged_bankruptcy", x)} />
        <YesNo label="Active consumer proposal" value={v.active_consumer_proposal} onChange={(x) => set("active_consumer_proposal", x)} />
        <YesNo label="Declined for financing in last 6 months" value={v.declined_last_6mo} onChange={(x) => set("declined_last_6mo", x)} />
        <YesNo label="Outstanding collections" value={v.outstanding_collections} onChange={(x) => set("outstanding_collections", x)} />
      </Section>

      <Section title="Vehicle intent">
        <Select label="New or used" value={v.new_or_used} options={NEW_OR_USED_OPTIONS} onChange={(x) => set("new_or_used", x)} required />
        <Select label="Body type" value={v.body_type} options={BODY_TYPE_OPTIONS} onChange={(x) => set("body_type", x)} required />
        <Select label="Total budget" value={v.total_budget} options={TOTAL_BUDGET_OPTIONS} onChange={(x) => set("total_budget", x)} required />
        <Select label="Monthly payment target" value={v.monthly_payment_target} options={MONTHLY_PAYMENT_TARGET_OPTIONS} onChange={(x) => set("monthly_payment_target", x)} required />
        <Select label="Down payment available" value={v.down_payment} options={DOWN_PAYMENT_OPTIONS} onChange={(x) => set("down_payment", x)} required />
        <YesNo label="Trade-in available" value={v.trade_in} onChange={(x) => set("trade_in", x)} />
        <Select label="Purchase timeline" value={v.purchase_timeline} options={PURCHASE_TIMELINE_OPTIONS} onChange={(x) => set("purchase_timeline", x)} required />
      </Section>

      <Section title="Logistics">
        <Select label="Preferred contact time" value={v.preferred_contact_time} options={CONTACT_TIME_OPTIONS} onChange={(x) => set("preferred_contact_time", x)} required />
        <Select label="Preferred language" value={v.preferred_language} options={LANGUAGE_OPTIONS} onChange={(x) => set("preferred_language", x)} required />
      </Section>

      <div>
        <label className="block text-sm font-semibold mb-1 text-[#0A2818]">Notes (optional, 300 char max)</label>
        <textarea
          maxLength={300}
          rows={3}
          className="crm-textarea"
          value={v.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
        <p className="text-xs text-[#6B7280] mt-1">{v.notes.length} / 300</p>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="crm-btn" disabled={busy}>
          {busy ? "Submitting…" : "Submit qualification"}
        </button>
        <button
          type="button"
          className="crm-btn crm-btn-secondary"
          onClick={() => setShowUnqual((s) => !s)}
        >
          Mark unqualified
        </button>
      </div>

      {showUnqual && (
        <div className="rounded-lg border border-[#D1D5DB] p-4 space-y-3">
          <label className="block text-sm font-semibold text-[#0A2818]">Reason</label>
          <select
            className="crm-select"
            value={unqualReason}
            onChange={(e) => setUnqualReason(e.target.value as UnqualifiedReason)}
          >
            {UNQUAL_REASONS.map((r) => (
              <option key={r} value={r}>{UNQUALIFIED_REASON_LABEL[r]}</option>
            ))}
          </select>
          <button type="button" className="crm-btn crm-btn-danger" disabled={busy} onClick={submitUnqualified}>
            {busy ? "Submitting…" : "Confirm mark unqualified"}
          </button>
        </div>
      )}
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-extrabold text-[#0A2818]">{title}</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </fieldset>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
  required,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-[#0A2818] mb-1">{label}</span>
      <select
        className="crm-select"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-[#0A2818] mb-1">{label}</span>
      <select className="crm-select" required value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </label>
  );
}
