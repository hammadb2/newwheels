// POST /api/elevenlabs/webhook — post-call webhook for ElevenLabs events.
//
// Handles two event types:
//   post_call_transcription — stores recording, transcript, duration,
//                             call analysis; fires SMS fallback on no-answer
//   call_initiation_failure — marks lead as failed

import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { submitQualification } from "@/lib/crm/leads/qualify";
import {
  ElevenLabsWebhookPayloadSchema,
  QualificationSchema,
  mapQualificationToPayload,
  NO_ANSWER_REASONS,
  RECORDINGS_BUCKET,
} from "@/lib/crm/elevenlabs/config";
import type { CallStatus, ElevenLabsWebhookPayload } from "@/lib/crm/elevenlabs/config";
import { verifyElevenLabsWebhookSignature } from "@/lib/crm/elevenlabs/verify";
import { sendSmsFallback } from "@/lib/crm/retell/sms-fallback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HANDLED_EVENTS = new Set([
  "post_call_transcription",
  "call_initiation_failure",
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

  const signature = req.headers.get("elevenlabs-signature");
  if (!(await verifyElevenLabsWebhookSignature(rawBody, signature))) {
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

  const parsed = ElevenLabsWebhookPayloadSchema.safeParse(json);
  if (!parsed.success) {
    console.error("elevenlabs webhook: invalid payload", parsed.error.issues);
    return NextResponse.json(
      { ok: false, error: "invalid_payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { type: eventType, data } = parsed.data;

  if (!HANDLED_EVENTS.has(eventType)) {
    return NextResponse.json({ ok: true, skipped: true, event: eventType });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "not_configured" },
      { status: 503 },
    );
  }

  const lead = await findLeadForConversation(supabase, data);
  if (!lead) {
    console.warn(
      "elevenlabs webhook: no lead found for conversation_id",
      data.conversation_id,
    );
    return NextResponse.json({ ok: true, skipped: true, reason: "no_lead" });
  }

  switch (eventType) {
    case "post_call_transcription":
      return handlePostCallTranscription(supabase, lead, data);
    case "call_initiation_failure":
      return handleCallInitiationFailure(supabase, lead, data);
    default:
      return NextResponse.json({ ok: true, skipped: true, event: eventType });
  }
}

// ---------------------------------------------------------------------------
// Lead lookup
// ---------------------------------------------------------------------------

async function findLeadForConversation(
  supabase: NonNullable<ReturnType<typeof getServerSupabase>>,
  data: ElevenLabsWebhookPayload["data"],
): Promise<LeadRow | null> {
  const { data: lead } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("retell_call_id", data.conversation_id)
    .maybeSingle();

  if (lead) return lead as LeadRow;

  // Try dynamic_variables.lead_id from conversation metadata.
  const metaLeadId =
    data.conversation_initiation_metadata?.dynamic_variables?.lead_id;

  if (!metaLeadId) return null;

  const { data: metaLead } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("id", metaLeadId)
    .maybeSingle();

  return (metaLead as LeadRow) ?? null;
}

// ---------------------------------------------------------------------------
// post_call_transcription — replaces call_ended + call_analyzed from Retell
// ---------------------------------------------------------------------------

async function handlePostCallTranscription(
  supabase: NonNullable<ReturnType<typeof getServerSupabase>>,
  lead: LeadRow,
  data: ElevenLabsWebhookPayload["data"],
) {
  const isNoAnswer = data.termination_reason
    ? NO_ANSWER_REASONS.has(data.termination_reason)
    : false;
  const callStatus: CallStatus = isNoAnswer
    ? "no_answer"
    : mapConversationStatus(data.status);
  const durationSeconds = data.call_duration_secs
    ? Math.round(data.call_duration_secs)
    : null;

  // Build transcript string from the array of transcript entries.
  const transcriptText = data.transcript
    ? data.transcript
        .map((t) => `${t.role === "agent" ? "Agent" : "User"}: ${t.message}`)
        .join("\n")
    : null;
  const transcriptObject = data.transcript
    ? data.transcript.map((t) => ({
        role: t.role,
        content: t.message,
      }))
    : null;

  // Download and store recording in Supabase storage.
  let storedRecordingUrl: string | null = null;
  if (data.recording_url) {
    try {
      const audioRes = await fetch(data.recording_url);
      if (audioRes.ok) {
        const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
        const objectKey = `${lead.id}/${data.conversation_id}-${Date.now()}.wav`;
        const { error: uploadErr } = await supabase.storage
          .from(RECORDINGS_BUCKET)
          .upload(objectKey, audioBuffer, {
            contentType: "audio/wav",
            upsert: false,
          });
        if (!uploadErr) {
          storedRecordingUrl = objectKey;
        } else {
          console.warn(
            "elevenlabs webhook: recording upload failed",
            uploadErr.message,
          );
          storedRecordingUrl = data.recording_url;
        }
      } else {
        storedRecordingUrl = data.recording_url;
      }
    } catch (err) {
      console.warn("elevenlabs webhook: recording fetch failed", err);
      storedRecordingUrl = data.recording_url;
    }
  }

  const updateData: Record<string, unknown> = {
    retell_call_id: data.conversation_id,
    retell_call_status: callStatus,
    retell_recording_url: storedRecordingUrl,
    retell_call_duration_seconds: durationSeconds,
    retell_transcript: transcriptText,
    retell_transcript_object: transcriptObject,
  };

  // Store analysis data if present.
  if (data.analysis) {
    updateData.retell_call_analysis = data.analysis as Record<string, unknown>;
    if (data.analysis.transcript_summary) {
      updateData.retell_call_summary = data.analysis.transcript_summary;
    }
  }

  if (isNoAnswer) {
    updateData.follow_up_needed = true;
  }

  await supabase.from("leads").update(updateData).eq("id", lead.id);

  await supabase.from("lead_audit_log").insert({
    lead_id: lead.id,
    event: "elevenlabs_call_ended",
    detail: {
      conversation_id: data.conversation_id,
      call_status: callStatus,
      termination_reason: data.termination_reason ?? null,
      duration_seconds: durationSeconds,
      has_recording: Boolean(storedRecordingUrl),
    } as Record<string, unknown>,
  });

  // No-answer handling: SMS fallback via Twilio.
  if (isNoAnswer) {
    void sendSmsFallback({
      toNumber: lead.phone,
      applyToken: lead.apply_token,
      firstName: lead.first_name,
    }).catch((err) => {
      console.warn("elevenlabs webhook: SMS fallback failed", err);
    });

    return NextResponse.json({
      ok: true,
      action: "no_answer_sms_fallback",
      lead_id: lead.id,
      call_status: callStatus,
      termination_reason: data.termination_reason,
    });
  }

  // Skip qualification if lead is already in a terminal state.
  if (
    lead.status === "sold" ||
    lead.status === "expired"
  ) {
    return NextResponse.json({
      ok: true,
      action: "already_processed",
      lead_id: lead.id,
      lead_status: lead.status,
    });
  }

  // Try to qualify from analysis data first, then fall back to
  // lead_qualifications rows written during the call.
  let qualData: Record<string, unknown> | null = null;

  if (data.analysis?.data_collection_results) {
    const qualParsed = QualificationSchema.safeParse(
      data.analysis.data_collection_results,
    );
    if (qualParsed.success) {
      qualData = qualParsed.data as Record<string, unknown>;
    } else {
      console.warn(
        "elevenlabs webhook: analysis data invalid, falling back to lead_qualifications",
        qualParsed.error.issues,
      );
    }
  }

  // Fallback: read qualification data collected during the call via the
  // update_qualification_section tool.
  if (!qualData) {
    const { data: existingQual } = await supabase
      .from("lead_qualifications")
      .select("*")
      .eq("lead_id", lead.id)
      .maybeSingle();

    if (existingQual) {
      const qualParsed = QualificationSchema.safeParse(existingQual);
      if (qualParsed.success) {
        qualData = qualParsed.data as Record<string, unknown>;
      } else {
        console.warn(
          "elevenlabs webhook: lead_qualifications data incomplete, skipping qualification",
          qualParsed.error.issues,
        );
      }
    }
  }

  if (qualData) {
    const parsed2 = QualificationSchema.parse(qualData);
    const payload = mapQualificationToPayload(parsed2);
    const qualifierId = lead.assigned_qualifier_id;
    let qualifierName = "ElevenLabs AI";
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
    action: "call_processed",
    lead_id: lead.id,
    call_status: callStatus,
  });
}

// ---------------------------------------------------------------------------
// call_initiation_failure
// ---------------------------------------------------------------------------

async function handleCallInitiationFailure(
  supabase: NonNullable<ReturnType<typeof getServerSupabase>>,
  lead: LeadRow,
  data: ElevenLabsWebhookPayload["data"],
) {
  await supabase
    .from("leads")
    .update({
      retell_call_id: data.conversation_id,
      retell_call_status: "failed" as CallStatus,
    })
    .eq("id", lead.id);

  await supabase.from("lead_audit_log").insert({
    lead_id: lead.id,
    event: "elevenlabs_call_initiation_failed",
    detail: {
      conversation_id: data.conversation_id,
      termination_reason: data.termination_reason ?? null,
    } as Record<string, unknown>,
  });

  return NextResponse.json({
    ok: true,
    action: "initiation_failure",
    lead_id: lead.id,
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapConversationStatus(status: string | null | undefined): CallStatus {
  switch (status) {
    case "done":
    case "ended":
    case "completed":
      return "completed";
    case "no_answer":
      return "no_answer";
    case "failed":
      return "failed";
    case "in_progress":
    case "ongoing":
      return "in_progress";
    default:
      return "completed";
  }
}
