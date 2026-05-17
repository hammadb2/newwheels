// POST /api/retell/update-qualification — Retell Custom Function endpoint.
//
// Called by the Retell agent after each qualification section completes.
// Writes structured data to the lead_qualifications row in real time so the
// CRM updates live during the call.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { verifyRetellSignature } from "@/lib/crm/retell/verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SECTIONS = ["identity", "financial", "credit", "vehicle", "logistics"] as const;
type Section = (typeof SECTIONS)[number];

const Body = z.object({
  call_id: z.string().min(1),
  lead_id: z.string().uuid(),
  section: z.enum(SECTIONS),
  data: z.record(z.unknown()),
});

// Map section names to the lead_qualifications columns they write.
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
  const rawBody = await req.text();

  const signature = req.headers.get("x-retell-signature");
  if (!(await verifyRetellSignature(rawBody, signature))) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
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

  const { call_id, lead_id, section, data } = parsed.data;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // Only write fields that belong to this section.
  const allowedFields = SECTION_FIELDS[section];
  const filteredData: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in data) filteredData[key] = data[key];
  }

  if (Object.keys(filteredData).length === 0) {
    return NextResponse.json({ ok: true, action: "no_fields" });
  }

  // Upsert into lead_qualifications: create row if it doesn't exist yet,
  // otherwise merge the new section data into the existing row.
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
    await supabase
      .from("lead_qualifications")
      .insert({ lead_id, ...filteredData });
  }

  await supabase.from("lead_audit_log").insert({
    lead_id,
    event: "retell_section_update",
    detail: {
      call_id,
      section,
      fields: Object.keys(filteredData),
    } as Record<string, unknown>,
  });

  return NextResponse.json({
    ok: true,
    action: "section_updated",
    section,
    fields_written: Object.keys(filteredData),
  });
}
