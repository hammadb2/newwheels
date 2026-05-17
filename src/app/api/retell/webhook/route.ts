// POST /api/retell/webhook — receives call completion events from Retell AI.
//
// When a qualification call completes, this webhook:
// 1. Verifies the signature
// 2. Updates retell_call_id and retell_call_status on the lead
// 3. Stores the recording URL and call duration
// 4. If qualification data is present, runs submitQualification() which
//    triggers scoring, pricing, marketplace listing, and the
//    qualification_complete email to CEO + Platform Ops
// 5. If the call was unanswered, fires SMS fallback via Twilio

import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { submitQualification } from "@/lib/crm/leads/qualify";
import {
  RetellWebhookPayloadSchema,
  RetellQualificationSchema,
  mapRetellToQualification,
} from "@/lib/crm/retell/config";
import type { RetellCallStatus } from "@/lib/crm/retell/config";
import { verifyRetellSignature } from "@/lib/crm/retell/verify";
import { sendSmsFallback } from "@/lib/crm/retell/sms-fallback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Retell webhook events we handle.
const CALL_ENDED = "call_ended";
const CALL_ANALYZED = "call_analyzed";

export async function POST(req: Request) {
  const rawBody = await req.text();

  // Verify webhook signature.
  const signature = req.headers.get("x-retell-signature");
  if (!verifyRetellSignature(rawBody, signature)) {
    return NextResponse.json(
      { ok: false, error: "invalid_signature" },
      { status: 401 },
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const parsed = RetellWebhookPayloadSchema.safeParse(json);
  if (!parsed.success) {
    console.error("retell webhook: invalid payload", parsed.error.issues);
    return NextResponse.json(
      { ok: false, error: "invalid_payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { event, call } = parsed.data;

  // We only handle call_ended and call_analyzed events.
  if (event !== CALL_ENDED && event !== CALL_ANALYZED) {
    return NextResponse.json({ ok: true, skipped: true, event });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "not_configured" },
      { status: 503 },
    );
  }

  // Look up the lead by retell_call_id — the call_id was stored when the
  // call was initiated via the Retell API.
  const { data: lead } = await supabase
    .from("leads")
    .select("id, first_name, phone, apply_token, status, assigned_qualifier_id")
    .eq("retell_call_id", call.call_id)
    .maybeSingle();

  if (!lead) {
    // If no lead has this call_id yet, try to find it via metadata.
    // The Retell agent is configured to pass lead_id in call metadata.
    const metaLeadId =
      call.metadata && typeof call.metadata === "object"
        ? (call.metadata as Record<string, unknown>).lead_id
        : null;

    if (!metaLeadId || typeof metaLeadId !== "string") {
      console.warn("retell webhook: no lead found for call_id", call.call_id);
      return NextResponse.json({ ok: true, skipped: true, reason: "no_lead" });
    }

    // Link the call_id to the lead.
    const { data: metaLead } = await supabase
      .from("leads")
      .select("id, first_name, phone, apply_token, status, assigned_qualifier_id")
      .eq("id", metaLeadId)
      .maybeSingle();

    if (!metaLead) {
      console.warn("retell webhook: lead from metadata not found", metaLeadId);
      return NextResponse.json({ ok: true, skipped: true, reason: "no_lead" });
    }

    return handleCallEvent(supabase, metaLead, call, event);
  }

  return handleCallEvent(supabase, lead, call, event);
}

async function handleCallEvent(
  supabase: ReturnType<typeof getServerSupabase> & object,
  lead: {
    id: string;
    first_name: string;
    phone: string;
    apply_token: string;
    status: string;
    assigned_qualifier_id: string | null;
  },
  call: {
    call_id: string;
    call_status: string;
    duration_ms?: number | null;
    recording_url?: string | null;
    call_analysis?: {
      call_successful?: boolean;
      custom_analysis_data?: unknown;
    } | null;
  },
  event: string,
) {
  const callStatus = mapCallStatus(call.call_status);
  const durationSeconds = call.duration_ms
    ? Math.round(call.duration_ms / 1000)
    : null;

  // Update lead with call metadata.
  await supabase
    .from("leads")
    .update({
      retell_call_id: call.call_id,
      retell_call_status: callStatus,
      retell_recording_url: call.recording_url ?? null,
      retell_call_duration_seconds: durationSeconds,
    })
    .eq("id", lead.id);

  // Log the event.
  await supabase.from("lead_audit_log").insert({
    lead_id: lead.id,
    event: `retell_${event}`,
    detail: {
      call_id: call.call_id,
      call_status: callStatus,
      duration_seconds: durationSeconds,
      has_recording: Boolean(call.recording_url),
      has_analysis: Boolean(call.call_analysis?.custom_analysis_data),
    } as Record<string, unknown>,
  });

  // Handle no-answer / voicemail — send SMS fallback.
  if (callStatus === "no_answer" || callStatus === "voicemail") {
    void sendSmsFallback({
      toNumber: lead.phone,
      applyToken: lead.apply_token,
      firstName: lead.first_name,
    }).catch((err) => {
      console.warn("retell webhook: SMS fallback failed", err);
    });

    return NextResponse.json({
      ok: true,
      action: "sms_fallback",
      lead_id: lead.id,
      call_status: callStatus,
    });
  }

  // Handle completed call with analysis data — run qualification.
  if (
    event === CALL_ANALYZED &&
    callStatus === "completed" &&
    call.call_analysis?.custom_analysis_data
  ) {
    const qualParsed = RetellQualificationSchema.safeParse(
      call.call_analysis.custom_analysis_data,
    );

    if (!qualParsed.success) {
      console.error(
        "retell webhook: qualification data invalid",
        qualParsed.error.issues,
      );
      return NextResponse.json({
        ok: true,
        action: "analysis_invalid",
        lead_id: lead.id,
        issues: qualParsed.error.issues,
      });
    }

    // Skip if lead is already qualified/sold/expired.
    if (
      lead.status === "available" ||
      lead.status === "sold" ||
      lead.status === "expired" ||
      lead.status === "qualified"
    ) {
      return NextResponse.json({
        ok: true,
        action: "already_processed",
        lead_id: lead.id,
        lead_status: lead.status,
      });
    }

    const payload = mapRetellToQualification(qualParsed.data);

    // Use the assigned qualifier as the qualifier_id, or null for
    // Retell-only qualifications (the lead_qualifications.qualified_by
    // column is nullable).
    const qualifierId = lead.assigned_qualifier_id;

    // Look up qualifier display name if we have one.
    let qualifierName = "Retell AI";
    if (qualifierId) {
      const { data: tm } = await supabase
        .from("team_members")
        .select("display_name")
        .eq("id", qualifierId)
        .maybeSingle();
      if (tm?.display_name) {
        qualifierName = tm.display_name as string;
      }
    }

    const result = await submitQualification({
      lead_id: lead.id,
      qualifier_id: qualifierId ?? "",
      qualifier_display_name: qualifierName,
      payload,
      call_duration_seconds: durationSeconds ?? undefined,
    });

    return NextResponse.json({
      ok: result.ok,
      action: "qualified",
      lead_id: lead.id,
      ...(result.ok && result.status === "available"
        ? { status: "available" }
        : {}),
      ...(!result.ok ? { error: result.error } : {}),
    });
  }

  return NextResponse.json({
    ok: true,
    action: "status_updated",
    lead_id: lead.id,
    call_status: callStatus,
  });
}

function mapCallStatus(retellStatus: string): RetellCallStatus {
  switch (retellStatus) {
    case "ended":
    case "completed":
      return "completed";
    case "no_answer":
      return "no_answer";
    case "voicemail":
      return "voicemail";
    case "failed":
      return "failed";
    case "in_progress":
    case "ongoing":
      return "in_progress";
    case "scheduled":
      return "scheduled";
    default:
      return "error";
  }
}
