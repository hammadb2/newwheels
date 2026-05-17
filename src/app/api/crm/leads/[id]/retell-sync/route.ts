// POST /api/crm/leads/:id/retell-sync — sync Retell call status from API.
//
// Fallback mechanism: queries the Retell API directly to get the current
// call status and updates the CRM lead record. Use when webhook events
// haven't fired (e.g. webhook URL misconfigured, transient network issue).
//
// Auth: CEO or Platform Ops only.

import { NextResponse } from "next/server";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { retellEnv } from "@/lib/crm/retell/config";
import type { RetellCallStatus } from "@/lib/crm/retell/config";

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
    .select("id, retell_call_id, retell_call_status")
    .eq("id", leadId)
    .maybeSingle();

  if (!lead) {
    return NextResponse.json({ ok: false, error: "lead_not_found" }, { status: 404 });
  }

  const callId = lead.retell_call_id as string | null;
  if (!callId) {
    return NextResponse.json({ ok: false, error: "no_retell_call" }, { status: 400 });
  }

  const { apiKey } = retellEnv();
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "retell_not_configured" }, { status: 503 });
  }

  // Fetch call details directly from Retell API.
  let retellCall: Record<string, unknown>;
  try {
    const res = await fetch(`https://api.retellai.com/v2/get-call/${callId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `retell_api_${res.status}`, detail: text },
        { status: 502 },
      );
    }
    retellCall = (await res.json()) as Record<string, unknown>;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "fetch_failed" },
      { status: 502 },
    );
  }

  // Map Retell API status to our internal status.
  const retellStatus = retellCall.call_status as string | undefined;
  const disconnectionReason = retellCall.disconnection_reason as string | undefined;
  const isNoAnswer = disconnectionReason
    ? ["dial_no_answer", "dial_failed", "dial_busy"].includes(disconnectionReason)
    : false;

  let newStatus: RetellCallStatus;
  if (isNoAnswer) {
    newStatus = "no_answer";
  } else {
    switch (retellStatus) {
      case "ended":
      case "completed":
        newStatus = "completed";
        break;
      case "error":
        newStatus = "error";
        break;
      case "in_progress":
      case "ongoing":
        newStatus = "in_progress";
        break;
      default:
        newStatus = "completed";
    }
  }

  // Build the update payload from Retell API response.
  const updateData: Record<string, unknown> = {
    retell_call_status: newStatus,
  };

  if (retellCall.duration_ms) {
    updateData.retell_call_duration_seconds = Math.round(
      (retellCall.duration_ms as number) / 1000,
    );
  }
  if (retellCall.start_timestamp) {
    updateData.retell_call_start_timestamp = retellCall.start_timestamp;
  }
  if (retellCall.end_timestamp) {
    updateData.retell_call_end_timestamp = retellCall.end_timestamp;
  }
  if (retellCall.transcript) {
    updateData.retell_transcript = retellCall.transcript;
  }
  if (retellCall.recording_url) {
    updateData.retell_recording_url = retellCall.recording_url;
  }

  const callAnalysis = retellCall.call_analysis as Record<string, unknown> | undefined;
  if (callAnalysis) {
    updateData.retell_call_analysis = callAnalysis;
    if (callAnalysis.call_summary) {
      updateData.retell_call_summary = callAnalysis.call_summary;
    }
    if (callAnalysis.user_sentiment) {
      updateData.retell_user_sentiment = callAnalysis.user_sentiment;
    }
  }

  if (isNoAnswer) {
    updateData.follow_up_needed = true;
  }

  await supabase.from("leads").update(updateData).eq("id", leadId);

  await supabase.from("lead_audit_log").insert({
    lead_id: leadId,
    event: "retell_status_synced",
    detail: {
      previous_status: lead.retell_call_status,
      new_status: newStatus,
      retell_api_status: retellStatus,
      disconnection_reason: disconnectionReason ?? null,
      source: "manual_sync",
    } as Record<string, unknown>,
  });

  return NextResponse.json({
    ok: true,
    action: "synced",
    lead_id: leadId,
    previous_status: lead.retell_call_status,
    new_status: newStatus,
  });
}
