// POST /api/apply/<token>/qualify — applicant self-qualification.
//
// The applicant fills out the multi-step form and submits their own
// qualification data. This writes to lead_qualifications and triggers
// the scoring pipeline (same as the agent-assisted flow).

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  findLeadByApplyToken,
  isProbablyToken,
} from "@/lib/crm/leads/apply";
import { submitQualification } from "@/lib/crm/leads/qualify";
import type { QualificationPayload } from "@/lib/crm/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SelfQualifySchema = z.object({
  visa_status: z.enum([
    "citizen", "permanent_resident", "open_work_permit",
    "lmia", "pgwp", "study_permit", "refugee_claimant", "other",
  ]),
  time_in_canada: z.enum(["under_1y", "1_2y", "2_5y", "5y_plus"]).nullable().optional(),
  has_ab_licence: z.boolean().nullable().optional(),
  monthly_income: z.enum(["under_2k", "2k_3k", "3k_4k", "4k_5k", "over_5k"]),
  income_type: z.enum(["employed", "self_employed", "benefits", "multiple"]),
  time_at_income: z.enum(["under_6m", "6m_1y", "1y_2y", "over_2y"]),
  monthly_debt: z.enum(["none", "under_500", "500_1k", "over_1k"]),
  credit_score: z.enum(["under_500", "500_580", "580_650", "650_plus", "unknown"]),
  active_bankruptcy: z.boolean(),
  discharged_bankruptcy: z.boolean().optional(),
  active_consumer_proposal: z.boolean(),
  declined_last_6mo: z.boolean().optional(),
  outstanding_collections: z.boolean().optional(),
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
});

type Ctx = { params: Promise<{ token: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  if (!isProbablyToken(token)) {
    return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 400 });
  }

  const lead = await findLeadByApplyToken(token);
  if (!lead) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (lead.status === "sold" || lead.status === "expired") {
    return NextResponse.json({ ok: false, error: "lead_closed" }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = SelfQualifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const payload: QualificationPayload = {
    visa_status: d.visa_status,
    time_in_canada: d.time_in_canada ?? (d.visa_status === "citizen" ? "5y_plus" : "under_1y"),
    has_ab_licence: d.has_ab_licence ?? true,
    monthly_income: d.monthly_income,
    income_type: d.income_type,
    time_at_income: d.time_at_income,
    monthly_debt: d.monthly_debt,
    credit_score: d.credit_score,
    active_bankruptcy: d.active_bankruptcy,
    discharged_bankruptcy: d.discharged_bankruptcy ?? false,
    active_consumer_proposal: d.active_consumer_proposal,
    declined_last_6mo: d.declined_last_6mo ?? false,
    outstanding_collections: d.outstanding_collections ?? false,
    new_or_used: d.new_or_used,
    body_type: d.body_type,
    total_budget: d.total_budget,
    monthly_payment_target: d.monthly_payment_target,
    down_payment: d.down_payment,
    trade_in: d.trade_in,
    purchase_timeline: d.purchase_timeline,
    preferred_contact_time: d.preferred_contact_time,
    preferred_language: d.preferred_language,
    notes: "Self-qualified via apply portal form",
  };

  const result = await submitQualification({
    lead_id: lead.id,
    qualifier_id: "self-service",
    qualifier_display_name: "Applicant (self-service)",
    payload,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status: result.status });
}
