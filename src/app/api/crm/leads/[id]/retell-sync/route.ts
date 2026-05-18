// POST /api/crm/leads/:id/retell-sync — sync call status from ElevenLabs API.
//
// Fallback mechanism: queries the ElevenLabs Conversations API directly to
// get the current call status and updates the CRM lead record. Use when
// webhook events haven't fired (e.g. webhook URL misconfigured, transient
// network issue).
//
// Auth: CEO or Platform Ops only.

import { NextResponse } from "next/server";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { elevenlabsEnv, QualificationSchema, mapQualificationToPayload } from "@/lib/crm/elevenlabs/config";
import type { CallStatus } from "@/lib/crm/elevenlabs/config";
import { submitQualification } from "@/lib/crm/leads/qualify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  await requireTeam("ceo");
  const { id: leadId } = await ctx.params;

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("id, retell_call_id, retell_call_status, status, assigned_qualifier_id")
    .eq("id", leadId)
    .maybeSingle();

  if (!lead) {
    return NextResponse.json({ ok: false, error: "lead_not_found" }, { status: 404 });
  }

  const conversationId = lead.retell_call_id as string | null;
  if (!conversationId) {
    return NextResponse.json({ ok: false, error: "no_call" }, { status: 400 });
  }

  const { apiKey } = elevenlabsEnv();
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "elevenlabs_not_configured" }, { status: 503 });
  }

  // Fetch conversation details from ElevenLabs API.
  let conversation: Record<string, unknown>;
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
      {
        headers: { "xi-api-key": apiKey },
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `elevenlabs_api_${res.status}`, detail: text },
        { status: 502 },
      );
    }
    conversation = (await res.json()) as Record<string, unknown>;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "fetch_failed" },
      { status: 502 },
    );
  }

  // Map ElevenLabs conversation status to our internal status.
  const elStatus = conversation.status as string | undefined;
  const terminationReason = conversation.termination_reason as string | undefined;
  const isNoAnswer = terminationReason
    ? ["no_answer", "dial_no_answer", "dial_failed", "dial_busy", "user_busy", "rejected"].includes(terminationReason)
    : false;

  let newStatus: CallStatus;
  if (isNoAnswer) {
    newStatus = "no_answer";
  } else {
    switch (elStatus) {
      case "done":
      case "ended":
      case "completed":
        newStatus = "completed";
        break;
      case "failed":
        newStatus = "failed";
        break;
      case "in_progress":
      case "ongoing":
        newStatus = "in_progress";
        break;
      default:
        newStatus = "completed";
    }
  }

  const updateData: Record<string, unknown> = {
    retell_call_status: newStatus,
  };

  const durationSecs = conversation.call_duration_secs as number | undefined;
  if (durationSecs) {
    updateData.retell_call_duration_seconds = Math.round(durationSecs);
  }

  // Build transcript from conversation transcript array.
  const transcript = conversation.transcript as
    | { role: string; message: string }[]
    | undefined;
  if (transcript && Array.isArray(transcript)) {
    updateData.retell_transcript = transcript
      .map((t) => `${t.role === "agent" ? "Agent" : "User"}: ${t.message}`)
      .join("\n");
    updateData.retell_transcript_object = transcript.map((t) => ({
      role: t.role,
      content: t.message,
    }));
  }

  if (conversation.recording_url) {
    updateData.retell_recording_url = conversation.recording_url;
  }

  const analysis = conversation.analysis as Record<string, unknown> | undefined;
  if (analysis) {
    updateData.retell_call_analysis = analysis;
    if (analysis.transcript_summary) {
      updateData.retell_call_summary = analysis.transcript_summary;
    }
  }

  if (isNoAnswer) {
    updateData.follow_up_needed = true;
  }

  await supabase.from("leads").update(updateData).eq("id", leadId);

  await supabase.from("lead_audit_log").insert({
    lead_id: leadId,
    event: "elevenlabs_status_synced",
    detail: {
      previous_status: lead.retell_call_status,
      new_status: newStatus,
      elevenlabs_status: elStatus,
      termination_reason: terminationReason ?? null,
      source: "manual_sync",
    } as Record<string, unknown>,
  });

  // Run qualification if the call completed and the lead is still in a
  // qualifiable state (qualifying or available).
  let qualAction: string | null = null;
  if (
    newStatus === "completed" &&
    lead.status !== "sold" &&
    lead.status !== "expired"
  ) {
    // Try qualification from analysis data, then from lead_qualifications.
    let qualData: Record<string, unknown> | null = null;

    if (analysis?.data_collection_results) {
      const dcr = analysis.data_collection_results as Record<string, unknown>;
      if (Object.keys(dcr).length > 0) {
        const qualParsed = QualificationSchema.safeParse(dcr);
        if (qualParsed.success) {
          qualData = qualParsed.data as Record<string, unknown>;
        }
      }
    }

    if (!qualData) {
      const { data: existingQual } = await supabase
        .from("lead_qualifications")
        .select("*")
        .eq("lead_id", leadId)
        .maybeSingle();

      if (existingQual) {
        const qualParsed = QualificationSchema.safeParse(existingQual);
        if (qualParsed.success) {
          qualData = qualParsed.data as Record<string, unknown>;
        }
      }
    }

    if (qualData) {
      const parsed2 = QualificationSchema.parse(qualData);
      const payload = mapQualificationToPayload(parsed2);
      const qualifierId = (lead.assigned_qualifier_id as string) ?? "";
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

      const durationVal = durationSecs ? Math.round(durationSecs) : undefined;
      const result = await submitQualification({
        lead_id: leadId,
        qualifier_id: qualifierId,
        qualifier_display_name: qualifierName,
        payload,
        call_duration_seconds: durationVal,
      });
      qualAction = result.ok ? "qualified" : `qual_failed:${result.error}`;
    }
  }

  return NextResponse.json({
    ok: true,
    action: "synced",
    lead_id: leadId,
    previous_status: lead.retell_call_status,
    new_status: newStatus,
    qualification: qualAction,
  });
}
