// Retell AI agent configuration and field mapping.
//
// Maps the structured response from the Retell AI qualification call to the
// 28-field QualificationPayload used by the scoring engine. The Retell agent
// is configured to collect these fields during the phone call and return them
// as structured JSON in the call.analyzed webhook event.
//
// This file is the single source of truth for the mapping — if the Retell
// agent prompt changes field names, update the FIELD_MAP here.

import { z } from "zod";
import type { QualificationPayload } from "../types";

// Environment
export function retellEnv() {
  return {
    apiKey: process.env.RETELL_API_KEY || "",
    agentId: process.env.RETELL_AGENT_ID || "",
    webhookSecret: process.env.RETELL_WEBHOOK_SECRET || "",
  };
}

export function isRetellConfigured(): boolean {
  const { apiKey, agentId } = retellEnv();
  return Boolean(apiKey) && Boolean(agentId);
}

// Retell call statuses we track on the lead record.
export type RetellCallStatus =
  | "initiated"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "no_answer"
  | "voicemail"
  | "failed"
  | "error";

export const RETELL_CALL_STATUSES: readonly RetellCallStatus[] = [
  "initiated",
  "scheduled",
  "in_progress",
  "completed",
  "no_answer",
  "voicemail",
  "failed",
  "error",
] as const;

// Phone number E.164 normalisation for Canadian numbers.
export function normalizeToE164(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

// The structured data schema that Retell returns after a completed call.
// Field names match the Retell agent prompt configuration.
export const RetellQualificationSchema = z.object({
  visa_status: z.enum([
    "citizen", "permanent_resident", "open_work_permit",
    "lmia", "pgwp", "study_permit", "refugee_claimant", "other",
  ]),
  time_in_canada: z.enum(["under_1y", "1_2y", "2_5y", "5y_plus"]),
  has_ab_licence: z.boolean(),

  monthly_income: z.enum(["under_2k", "2k_3k", "3k_4k", "4k_5k", "over_5k"]),
  income_type: z.enum(["employed", "self_employed", "benefits", "multiple"]),
  time_at_income: z.enum(["under_6m", "6m_1y", "1y_2y", "over_2y"]),
  monthly_debt: z.enum(["none", "under_500", "500_1k", "over_1k"]),

  credit_score: z.enum(["under_500", "500_580", "580_650", "650_plus", "unknown"]),
  active_bankruptcy: z.boolean(),
  discharged_bankruptcy: z.boolean(),
  active_consumer_proposal: z.boolean(),
  declined_last_6mo: z.boolean(),
  outstanding_collections: z.boolean(),

  new_or_used: z.enum(["new", "used", "either"]),
  body_type: z.enum(["suv", "truck", "sedan", "minivan", "any"]),
  total_budget: z.enum(["under_15k", "15_20", "20_25", "25_30", "over_30"]),
  monthly_payment_target: z.enum(["under_300", "300_400", "400_500", "over_500"]),
  down_payment: z.enum(["none", "under_1k", "1_2k", "2_5k", "over_5k"]),
  trade_in: z.boolean(),
  purchase_timeline: z.enum(["asap", "within_2_weeks", "within_month", "just_browsing"]),

  preferred_contact_time: z.enum(["morning", "afternoon", "evening"]),
  preferred_language: z.enum([
    "english", "tagalog", "punjabi", "hindi", "arabic", "french", "other",
  ]),

  notes: z.string().max(300).optional().nullable(),
});

export type RetellQualificationData = z.infer<typeof RetellQualificationSchema>;

// The Retell webhook payload for call lifecycle events.
export const RetellWebhookPayloadSchema = z.object({
  event: z.string(),
  call: z.object({
    call_id: z.string(),
    agent_id: z.string().optional().nullable(),
    call_status: z.string(),
    start_timestamp: z.number().optional().nullable(),
    end_timestamp: z.number().optional().nullable(),
    duration_ms: z.number().optional().nullable(),
    recording_url: z.string().url().optional().nullable(),
    from_number: z.string().optional().nullable(),
    to_number: z.string().optional().nullable(),
    direction: z.string().optional().nullable(),
    disconnection_reason: z.string().optional().nullable(),
    metadata: z.record(z.unknown()).optional().nullable(),
    retell_llm_dynamic_variables: z.record(z.string()).optional().nullable(),
    call_analysis: z.object({
      call_successful: z.boolean().optional(),
      call_summary: z.string().optional().nullable(),
      user_sentiment: z.string().optional().nullable(),
      custom_analysis_data: z.unknown().optional(),
    }).optional().nullable(),
    transcript: z.string().optional().nullable(),
    transcript_object: z.array(z.object({
      role: z.string(),
      content: z.string(),
    }).passthrough()).optional().nullable(),
    transcript_with_tool_calls: z.array(z.unknown()).optional().nullable(),
  }),
});

export type RetellWebhookPayload = z.infer<typeof RetellWebhookPayloadSchema>;

// Disconnection reasons that indicate no-answer / unreachable.
export const NO_ANSWER_REASONS = new Set([
  "dial_no_answer",
  "dial_failed",
  "dial_busy",
]);

// Retell API call creation. Fires an outbound phone call via the Retell API.
export type CreateRetellCallInput = {
  toNumber: string;
  leadId: string;
  leadName: string;
  applyToken: string;
  preferredLanguage?: string | null;
};

export type CreateRetellCallResult =
  | { ok: true; callId: string }
  | { ok: false; error: string };

export async function createRetellCall(
  input: CreateRetellCallInput,
): Promise<CreateRetellCallResult> {
  const { apiKey, agentId } = retellEnv();
  const fromNumber = process.env.RETELL_PHONE_NUMBER || "";

  if (!apiKey || !agentId || !fromNumber) {
    return { ok: false, error: "retell_not_configured" };
  }

  const toE164 = normalizeToE164(input.toNumber);

  const body: Record<string, unknown> = {
    from_number: fromNumber,
    to_number: toE164,
    override_agent_id: agentId,
    metadata: {
      lead_id: input.leadId,
      lead_name: input.leadName,
      apply_token: input.applyToken,
    },
  };

  if (input.preferredLanguage && input.preferredLanguage !== "english") {
    body.retell_llm_dynamic_variables = {
      preferred_language: input.preferredLanguage,
    };
  }

  try {
    const res = await fetch("https://api.retellai.com/v2/create-phone-call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `retell_api_${res.status}: ${text}` };
    }

    const json = (await res.json()) as { call_id?: string };
    if (!json.call_id) {
      return { ok: false, error: "retell_no_call_id" };
    }
    return { ok: true, callId: json.call_id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// Recording bucket in Supabase storage.
export const RECORDINGS_BUCKET = "recordings";

// Map the Retell structured response to the QualificationPayload.
// This is a straight 1:1 mapping — the Retell agent is configured to return
// field names that match QualificationPayload exactly.
export function mapRetellToQualification(
  data: RetellQualificationData,
): QualificationPayload {
  return {
    visa_status: data.visa_status,
    time_in_canada: data.time_in_canada,
    has_ab_licence: data.has_ab_licence,
    monthly_income: data.monthly_income,
    income_type: data.income_type,
    time_at_income: data.time_at_income,
    monthly_debt: data.monthly_debt,
    credit_score: data.credit_score,
    active_bankruptcy: data.active_bankruptcy,
    discharged_bankruptcy: data.discharged_bankruptcy,
    active_consumer_proposal: data.active_consumer_proposal,
    declined_last_6mo: data.declined_last_6mo,
    outstanding_collections: data.outstanding_collections,
    new_or_used: data.new_or_used,
    body_type: data.body_type,
    total_budget: data.total_budget,
    monthly_payment_target: data.monthly_payment_target,
    down_payment: data.down_payment,
    trade_in: data.trade_in,
    purchase_timeline: data.purchase_timeline,
    preferred_contact_time: data.preferred_contact_time,
    preferred_language: data.preferred_language,
    notes: data.notes ?? null,
  };
}

// The 28 qualification fields that the Retell agent must collect.
// Used to validate agent configuration completeness.
export const QUALIFICATION_FIELDS = [
  "visa_status",
  "time_in_canada",
  "has_ab_licence",
  "monthly_income",
  "income_type",
  "time_at_income",
  "monthly_debt",
  "credit_score",
  "active_bankruptcy",
  "discharged_bankruptcy",
  "active_consumer_proposal",
  "declined_last_6mo",
  "outstanding_collections",
  "new_or_used",
  "body_type",
  "total_budget",
  "monthly_payment_target",
  "down_payment",
  "trade_in",
  "purchase_timeline",
  "preferred_contact_time",
  "preferred_language",
] as const;
