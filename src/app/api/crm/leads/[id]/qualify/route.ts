// POST /api/crm/leads/:id/qualify — submit the qualification checklist.
//
// Auth: must be CRM team member with role lead_qualifier (or CEO override).

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { readSession } from "@/lib/crm/auth/session";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { submitQualification, markLeadUnqualified } from "@/lib/crm/leads/qualify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QualifyBody = z.object({
  action: z.literal("qualify"),
  visa_status: z.enum([
    "citizen",
    "permanent_resident",
    "open_work_permit",
    "lmia",
    "pgwp",
    "study_permit",
    "refugee_claimant",
    "other",
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
    "english",
    "tagalog",
    "punjabi",
    "hindi",
    "arabic",
    "french",
    "other",
  ]),

  notes: z.string().max(300).optional().nullable(),
  call_duration_seconds: z.number().int().nonnegative().optional(),
});

const UnqualifyBody = z.object({
  action: z.literal("unqualify"),
  reason: z.enum([
    "uncontactable",
    "fake_information",
    "not_serious_intent",
    "outside_alberta",
    "underage",
    "duplicate_submission",
    "other",
  ]),
  detail: z.string().max(500).optional(),
});

const Body = z.union([QualifyBody, UnqualifyBody]);

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { subject } = await requireTeam("lead_qualifier");
  const session = await readSession("crm");
  if (!session) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { id: leadId } = await ctx.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: tm } = await supabase
    .from("team_members")
    .select("display_name")
    .eq("id", subject.team_member_id)
    .single();

  const displayName = (tm?.display_name as string) ?? "Lead Qualifier";

  if (parsed.data.action === "unqualify") {
    const result = await markLeadUnqualified({
      lead_id: leadId,
      qualifier_id: subject.team_member_id,
      reason: parsed.data.reason,
      detail: parsed.data.detail,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  // qualify path
  const { action: _unused, call_duration_seconds, ...payload } = parsed.data;
  void _unused;
  const result = await submitQualification({
    lead_id: leadId,
    qualifier_id: subject.team_member_id,
    qualifier_display_name: displayName,
    payload,
    call_duration_seconds,
  });

  // IMPORTANT: do NOT include score or tier in the response. The Lead
  // Qualifier UI must never display them. We strip them here defensively.
  if (result.ok && result.status === "available") {
    return NextResponse.json({
      ok: true,
      status: "submitted",
      lead_id: result.lead_id,
    });
  }
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
