// ElevenLabs Conversational AI agent configuration and field mapping.
//
// Maps the structured response from the ElevenLabs qualification call to the
// 28-field QualificationPayload used by the scoring engine. The ElevenLabs
// agent is configured to collect these fields during the phone call via
// webhook tool calls that fire section-by-section.
//
// This file is the single source of truth for the mapping — if the ElevenLabs
// agent prompt changes field names, update the FIELD_MAP here.

import { z } from "zod";
import type { QualificationPayload } from "../types";

// Environment
export function elevenlabsEnv() {
  return {
    apiKey: process.env.ELEVENLABS_API_KEY || "",
    agentId: process.env.ELEVENLABS_AGENT_ID || "",
    phoneNumberId: process.env.ELEVENLABS_PHONE_NUMBER_ID || "",
    webhookSecret: process.env.ELEVENLABS_WEBHOOK_SECRET || "",
    toolSecret: process.env.ELEVENLABS_TOOL_SECRET || "",
  };
}

export function isElevenLabsConfigured(): boolean {
  const { apiKey, agentId, phoneNumberId } = elevenlabsEnv();
  return Boolean(apiKey) && Boolean(agentId) && Boolean(phoneNumberId);
}

// Call statuses we track on the lead record (same DB column as before).
export type CallStatus =
  | "initiated"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "no_answer"
  | "voicemail"
  | "failed"
  | "error";

export const CALL_STATUSES: readonly CallStatus[] = [
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

// The structured data schema that the agent collects via webhook tools.
// Field names match QualificationPayload exactly.
export const QualificationSchema = z.object({
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

export type QualificationData = z.infer<typeof QualificationSchema>;

// ElevenLabs post-call webhook payload schema.
export const ElevenLabsWebhookPayloadSchema = z.object({
  type: z.string(),
  event_timestamp: z.number().optional().nullable(),
  data: z.object({
    agent_id: z.string().optional().nullable(),
    conversation_id: z.string(),
    status: z.string().optional().nullable(),
    transcript: z.array(z.object({
      role: z.string(),
      message: z.string(),
      time_in_call_secs: z.number().optional(),
    }).passthrough()).optional().nullable(),
    metadata: z.record(z.unknown()).optional().nullable(),
    analysis: z.object({
      call_successful: z.boolean().optional(),
      transcript_summary: z.string().optional().nullable(),
      data_collection_results: z.record(z.unknown()).optional().nullable(),
      evaluation_criteria_results: z.record(z.unknown()).optional().nullable(),
    }).optional().nullable(),
    conversation_initiation_metadata: z.object({
      conversation_config_override: z.record(z.unknown()).optional().nullable(),
      dynamic_variables: z.record(z.string()).optional().nullable(),
    }).passthrough().optional().nullable(),
    call_duration_secs: z.number().optional().nullable(),
    cost: z.number().optional().nullable(),
    recording_url: z.string().optional().nullable(),
    termination_reason: z.string().optional().nullable(),
  }),
});

export type ElevenLabsWebhookPayload = z.infer<typeof ElevenLabsWebhookPayloadSchema>;

// Termination reasons that indicate no-answer / unreachable.
export const NO_ANSWER_REASONS = new Set([
  "no_answer",
  "dial_no_answer",
  "dial_failed",
  "dial_busy",
  "user_busy",
  "rejected",
]);

// ElevenLabs outbound call creation via Twilio integration.
export type CreateElevenLabsCallInput = {
  toNumber: string;
  leadId: string;
  leadName: string;
  applyToken: string;
  preferredLanguage?: string | null;
};

export type CreateElevenLabsCallResult =
  | { ok: true; conversationId: string }
  | { ok: false; error: string };

export async function createElevenLabsCall(
  input: CreateElevenLabsCallInput,
): Promise<CreateElevenLabsCallResult> {
  const { apiKey, agentId, phoneNumberId } = elevenlabsEnv();

  if (!apiKey || !agentId || !phoneNumberId) {
    return { ok: false, error: "elevenlabs_not_configured" };
  }

  const toE164 = normalizeToE164(input.toNumber);

  const body: Record<string, unknown> = {
    agent_id: agentId,
    agent_phone_number_id: phoneNumberId,
    to_number: toE164,
    conversation_initiation_client_data: {
      dynamic_variables: {
        lead_name: input.leadName,
        lead_id: input.leadId,
        apply_token: input.applyToken,
      },
    },
  };

  try {
    const res = await fetch(
      "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `elevenlabs_api_${res.status}: ${text}` };
    }

    const json = (await res.json()) as { conversation_id?: string };
    if (!json.conversation_id) {
      return { ok: false, error: "elevenlabs_no_conversation_id" };
    }
    return { ok: true, conversationId: json.conversation_id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// Recording bucket in Supabase storage.
export const RECORDINGS_BUCKET = "recordings";

// Map the structured qualification data to QualificationPayload.
export function mapQualificationToPayload(
  data: QualificationData,
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

// The 22 qualification fields that the agent must collect.
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
