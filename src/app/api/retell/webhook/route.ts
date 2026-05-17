// POST /api/retell/webhook — account-level webhook for all Retell call events.
//
// Handles four event types:
//   call_started      — marks lead in_progress, logs to audit
//   call_ended        — stores recording (fetched to Supabase storage),
//                       transcript, duration, timestamps; fires SMS fallback
//                       on no-answer via Twilio
//   call_analyzed     — stores call_analysis JSON (summary, sentiment,
//                       custom extraction); triggers scoring + qualification
//                       email if qualification data is complete
//   transcript_updated — upserts latest transcript on the lead record

import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { submitQualification } from "@/lib/crm/leads/qualify";
import {
  RetellWebhookPayloadSchema,
  RetellQualificationSchema,
  mapRetellToQualification,
  NO_ANSWER_REASONS,
  RECORDINGS_BUCKET,
} from "@/lib/crm/retell/config";
import type { RetellCallStatus, RetellWebhookPayload } from "@/lib/crm/retell/config";
import { verifyRetellSignature } from "@/lib/crm/retell/verify";
import { sendSmsFallback } from "@/lib/crm/retell/sms-fallback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HANDLED_EVENTS = new Set([
  "call_started",
  "call_ended",
  "call_analyzed",
  "transcript_updated",
]);

type LeadRow = {
  id: string;
  first_name: string;
  phone: string;
  apply_token: string;
  status: string;
  assigned_qualifier_id: string | null;
  preferred_contact_time: string | null;
};

const LEAD_SELECT =
  "id, first_name, phone, apply_token, status, assigned_qualifier_id, preferred_contact_time";

export async function POST(req: Request) {
  const rawBody = await req.text();

  const signature = req.headers.get("x-retell-signature");
  if (!(await verifyRetellSignature(rawBody, signature))) {
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

  if (!HANDLED_EVENTS.has(event)) {
    return NextResponse.json({ ok: true, skipped: true, event });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "not_configured" },
      { status: 503 },
    );
  }

  const lead = await findLeadForCall(supabase, call);
  if (!lead) {
    console.warn("retell webhook: no lead found for call_id", call.call_id);
    return NextResponse.json({ ok: true, skipped: true, reason: "no_lead" });
  }

  switch (event) {
    case "call_started":
      return handleCallStarted(supabase, lead, call);
    case "call_ended":
      return handleCallEnded(supabase, lead, call);
    case "call_analyzed":
      return handleCallAnalyzed(supabase, lead, call);
    case "transcript_updated":
      return handleTranscriptUpdated(supabase, lead, call);
    default:
      return NextResponse.json({ ok: true, skipped: true, event });
  }
}

// ---------------------------------------------------------------------------
// Lead lookup
// ---------------------------------------------------------------------------

async function findLeadForCall(
  supabase: NonNullable<ReturnType<typeof getServerSupabase>>,
  call: RetellWebhookPayload["call"],
): Promise<LeadRow | null> {
  const { data: lead } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("retell_call_id", call.call_id)
    .maybeSingle();

  if (lead) return lead as LeadRow;

  const metaLeadId =
    call.metadata && typeof call.metadata === "object"
      ? (call.metadata as Record<string, unknown>).lead_id
      : null;

  if (!metaLeadId || typeof metaLeadId !== "string") return null;

  const { data: metaLead } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("id", metaLeadId)
    .maybeSingle();

  return (metaLead as LeadRow) ?? null;
}

// ---------------------------------------------------------------------------
// call_started
// ---------------------------------------------------------------------------

async function handleCallStarted(
  supabase: NonNullable<ReturnType<typeof getServerSupabase>>,
  lead: LeadRow,
  call: RetellWebhookPayload["call"],
) {
  await supabase
    .from("leads")
    .update({
      retell_call_id: call.call_id,
      retell_call_status: "in_progress" as RetellCallStatus,
    })
    .eq("id", lead.id);

  await supabase.from("lead_audit_log").insert({
    lead_id: lead.id,
    event: "retell_call_started",
    detail: { call_id: call.call_id } as Record<string, unknown>,
  });

  return NextResponse.json({
    ok: true,
    action: "call_started",
    lead_id: lead.id,
  });
}

// ---------------------------------------------------------------------------
// call_ended
// ---------------------------------------------------------------------------

async function handleCallEnded(
  supabase: NonNullable<ReturnType<typeof getServerSupabase>>,
  lead: LeadRow,
  call: RetellWebhookPayload["call"],
) {
  const isNoAnswer = call.disconnection_reason
    ? NO_ANSWER_REASONS.has(call.disconnection_reason)
    : false;
  const callStatus: RetellCallStatus = isNoAnswer
    ? "no_answer"
    : mapCallStatus(call.call_status);
  const durationSeconds = call.duration_ms
    ? Math.round(call.duration_ms / 1000)
    : null;

  // Fetch and store recording in Supabase storage. Retell recording URLs are
  // only accessible for ~10 minutes, so we download immediately.
  let storedRecordingUrl: string | null = null;
  if (call.recording_url) {
    try {
      const audioRes = await fetch(call.recording_url);
      if (audioRes.ok) {
        const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
        const objectKey = `${lead.id}/${call.call_id}-${Date.now()}.wav`;
        const { error: uploadErr } = await supabase.storage
          .from(RECORDINGS_BUCKET)
          .upload(objectKey, audioBuffer, {
            contentType: "audio/wav",
            upsert: false,
          });
        if (!uploadErr) {
          storedRecordingUrl = objectKey;
        } else {
          console.warn("retell webhook: recording upload failed", uploadErr.message);
          storedRecordingUrl = call.recording_url;
        }
      } else {
        storedRecordingUrl = call.recording_url;
      }
    } catch (err) {
      console.warn("retell webhook: recording fetch failed", err);
      storedRecordingUrl = call.recording_url;
    }
  }

  const updateData: Record<string, unknown> = {
    retell_call_id: call.call_id,
    retell_call_status: callStatus,
    retell_recording_url: storedRecordingUrl,
    retell_call_duration_seconds: durationSeconds,
    retell_call_start_timestamp: call.start_timestamp ?? null,
    retell_call_end_timestamp: call.end_timestamp ?? null,
    retell_transcript: call.transcript ?? null,
  };

  if (isNoAnswer) {
    updateData.follow_up_needed = true;
  }

  await supabase
    .from("leads")
    .update(updateData)
    .eq("id", lead.id);

  await supabase.from("lead_audit_log").insert({
    lead_id: lead.id,
    event: "retell_call_ended",
    detail: {
      call_id: call.call_id,
      call_status: callStatus,
      disconnection_reason: call.disconnection_reason ?? null,
      duration_seconds: durationSeconds,
      has_recording: Boolean(storedRecordingUrl),
    } as Record<string, unknown>,
  });

  // No-answer handling: SMS fallback via Twilio + follow-up flag.
  if (isNoAnswer) {
    void sendSmsFallback({
      toNumber: lead.phone,
      applyToken: lead.apply_token,
      firstName: lead.first_name,
    }).catch((err) => {
      console.warn("retell webhook: SMS fallback failed", err);
    });

    return NextResponse.json({
      ok: true,
      action: "no_answer_sms_fallback",
      lead_id: lead.id,
      call_status: callStatus,
      disconnection_reason: call.disconnection_reason,
    });
  }

  return NextResponse.json({
    ok: true,
    action: "call_ended",
    lead_id: lead.id,
    call_status: callStatus,
  });
}

// ---------------------------------------------------------------------------
// call_analyzed
// ---------------------------------------------------------------------------

async function handleCallAnalyzed(
  supabase: NonNullable<ReturnType<typeof getServerSupabase>>,
  lead: LeadRow,
  call: RetellWebhookPayload["call"],
) {
  // Store the full call_analysis JSON.
  const analysisUpdate: Record<string, unknown> = {};
  if (call.call_analysis) {
    analysisUpdate.retell_call_analysis = call.call_analysis as Record<string, unknown>;
    if (call.call_analysis.call_summary) {
      analysisUpdate.retell_call_summary = call.call_analysis.call_summary;
    }
    if (call.call_analysis.user_sentiment) {
      analysisUpdate.retell_user_sentiment = call.call_analysis.user_sentiment;
    }
  }
  if (call.transcript) {
    analysisUpdate.retell_transcript = call.transcript;
  }

  if (Object.keys(analysisUpdate).length > 0) {
    await supabase
      .from("leads")
      .update(analysisUpdate)
      .eq("id", lead.id);
  }

  await supabase.from("lead_audit_log").insert({
    lead_id: lead.id,
    event: "retell_call_analyzed",
    detail: {
      call_id: call.call_id,
      has_analysis: Boolean(call.call_analysis),
      has_custom_data: Boolean(call.call_analysis?.custom_analysis_data),
      call_summary: call.call_analysis?.call_summary ?? null,
      user_sentiment: call.call_analysis?.user_sentiment ?? null,
    } as Record<string, unknown>,
  });

  // If qualification data is present in post-call analysis, run scoring.
  if (call.call_analysis?.custom_analysis_data) {
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

    // Skip if lead is already processed.
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
    const qualifierId = lead.assigned_qualifier_id;
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

    const durationSeconds = call.duration_ms
      ? Math.round(call.duration_ms / 1000)
      : null;

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
    action: "analysis_stored",
    lead_id: lead.id,
  });
}

// ---------------------------------------------------------------------------
// transcript_updated — fires multiple times during call, upsert.
// ---------------------------------------------------------------------------

async function handleTranscriptUpdated(
  supabase: NonNullable<ReturnType<typeof getServerSupabase>>,
  lead: LeadRow,
  call: RetellWebhookPayload["call"],
) {
  const updateData: Record<string, unknown> = {};
  if (call.transcript) {
    updateData.retell_transcript = call.transcript;
  }
  if (call.transcript_object) {
    updateData.retell_transcript_object = call.transcript_object;
  }

  if (Object.keys(updateData).length > 0) {
    await supabase
      .from("leads")
      .update(updateData)
      .eq("id", lead.id);
  }

  return NextResponse.json({
    ok: true,
    action: "transcript_updated",
    lead_id: lead.id,
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
