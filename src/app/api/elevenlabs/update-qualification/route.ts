// POST /api/elevenlabs/update-qualification — ElevenLabs webhook tool endpoint.
//
// Called by the ElevenLabs agent after each qualification section completes.
// Writes structured data to the lead_qualifications row in real time so the
// CRM updates live during the call.
//
// Auth: shared secret in Authorization header (Bearer token).
// ElevenLabs sends: { tool_call_id, tool_name, parameters, conversation_id }

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { verifyToolSecret } from "@/lib/crm/elevenlabs/verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SECTIONS = ["identity", "financial", "credit", "vehicle", "logistics"] as const;
type Section = (typeof SECTIONS)[number];

const ToolCallBody = z.object({
  tool_call_id: z.string().optional(),
  tool_name: z.string().optional(),
  conversation_id: z.string().optional(),
  parameters: z.object({
    lead_id: z.string().uuid(),
    section: z.enum(SECTIONS),
    data: z.record(z.unknown()).optional(),
    // Allow individual fields at the top level of parameters too, so the
    // agent can send them either nested inside `data` or flat.
  }).passthrough(),
});

const SECTION_FIELDS: Record<Section, string[]> = {
  identity: ["visa_status", "time_in_canada", "has_ab_licence"],
  financial: ["monthly_income", "income_type", "time_at_income", "monthly_debt"],
  credit: [
    "credit_score",
    "active_bankruptcy",
    "discharged_bankruptcy",
    "active_consumer_proposal",
    "declined_last_6mo",
    "outstanding_collections",
  ],
  vehicle: [
    "new_or_used",
    "body_type",
    "total_budget",
    "monthly_payment_target",
    "down_payment",
    "trade_in",
    "purchase_timeline",
  ],
  logistics: ["preferred_contact_time", "preferred_language"],
};

export async function POST(req: Request) {
  if (!verifyToolSecret(req)) {
    return NextResponse.json({ result: "invalid_secret" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ result: "invalid_json" }, { status: 400 });
  }

  const parsed = ToolCallBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { result: "invalid_input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { lead_id, section, data, ...rest } = parsed.data.parameters;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ result: "not_configured" }, { status: 503 });
  }

  // Merge fields from `data` object and any flat top-level fields the agent
  // may have sent (ElevenLabs sometimes sends fields either way).
  const merged: Record<string, unknown> = { ...(data ?? {}), ...rest };

  const allowedFields = SECTION_FIELDS[section];
  const filteredData: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in merged) filteredData[key] = merged[key];
  }

  if (Object.keys(filteredData).length === 0) {
    return NextResponse.json({ result: "no_fields" });
  }

  const { data: existing } = await supabase
    .from("lead_qualifications")
    .select("id")
    .eq("lead_id", lead_id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("lead_qualifications")
      .update(filteredData)
      .eq("lead_id", lead_id);
  } else {
    // First insert for this lead — columns have DB defaults so partial
    // section data (e.g. only identity fields) will succeed.
    await supabase
      .from("lead_qualifications")
      .insert({ lead_id, ...filteredData });
  }

  await supabase.from("lead_audit_log").insert({
    lead_id,
    event: "elevenlabs_section_update",
    detail: {
      conversation_id: parsed.data.conversation_id ?? null,
      section,
      fields: Object.keys(filteredData),
    } as Record<string, unknown>,
  });

  return NextResponse.json({
    result: "section_updated",
    section,
    fields_written: Object.keys(filteredData),
  });
}
