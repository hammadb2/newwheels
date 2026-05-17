"use client";

// Retell AI call player — recording, transcript, sentiment, and call summary.
// Visible to CEO and Platform Ops only on the lead detail page.

import { useState } from "react";

type TranscriptEntry = {
  role: string;
  content: string;
};

type Props = {
  recordingUrl: string;
  callStatus: string;
  durationSeconds: number | null;
  callId: string;
  transcript?: string | null;
  transcriptObject?: TranscriptEntry[] | null;
  callSummary?: string | null;
  userSentiment?: string | null;
  leadId: string;
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const STATUS_LABEL: Record<string, string> = {
  initiated: "Initiated",
  completed: "Completed",
  no_answer: "No answer",
  voicemail: "Voicemail",
  failed: "Failed",
  in_progress: "In progress",
  scheduled: "Scheduled",
  error: "Error",
};

const STATUS_DOT: Record<string, string> = {
  initiated: "bg-blue-400",
  in_progress: "bg-amber-500",
  completed: "bg-emerald-500",
  no_answer: "bg-red-400",
  voicemail: "bg-orange-400",
  failed: "bg-red-500",
  error: "bg-red-500",
};

const SENTIMENT_LABEL: Record<string, { text: string; color: string }> = {
  Positive: { text: "Positive", color: "text-emerald-600" },
  Negative: { text: "Negative", color: "text-red-600" },
  Neutral: { text: "Neutral", color: "text-[#6B7280]" },
  Unknown: { text: "Unknown", color: "text-[#6B7280]" },
};

export function RetellCallPlayer({
  recordingUrl,
  callStatus,
  durationSeconds,
  callId,
  transcript,
  transcriptObject,
  callSummary,
  userSentiment,
  leadId,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const sentimentInfo = userSentiment
    ? SENTIMENT_LABEL[userSentiment] ?? { text: userSentiment, color: "text-[#6B7280]" }
    : null;

  return (
    <div className="space-y-4">
      {/* Header: status + duration + sentiment */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#0A2818]">Retell call</h2>
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                STATUS_DOT[callStatus] ?? "bg-gray-400"
              }`}
            />
            {STATUS_LABEL[callStatus] ?? callStatus}
          </span>
          {durationSeconds !== null && durationSeconds > 0 && (
            <span className="text-[#6B7280]">{formatDuration(durationSeconds)}</span>
          )}
          {sentimentInfo && (
            <span className={`font-medium ${sentimentInfo.color}`}>
              {sentimentInfo.text}
            </span>
          )}
        </div>
      </div>

      {/* Call summary from post-call analysis */}
      {callSummary && (
        <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
          <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1">
            Call summary
          </p>
          <p className="text-sm text-[#0A2818]">{callSummary}</p>
        </div>
      )}

      {/* Sync button — when status is stuck on initiated/in_progress */}
      {(callStatus === "initiated" || callStatus === "in_progress") && leadId && (
        <button
          type="button"
          disabled={syncing}
          onClick={async () => {
            setSyncing(true);
            try {
              const res = await fetch(`/api/crm/leads/${leadId}/retell-sync`, {
                method: "POST",
              });
              if (res.ok) {
                window.location.reload();
              }
            } catch {
              // silently fail
            } finally {
              setSyncing(false);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3 py-1.5 text-xs font-medium text-[#0A2818] hover:bg-[#FAF7F0] disabled:opacity-50"
        >
          {syncing ? "Syncing…" : "Sync from Retell"}
        </button>
      )}

      {/* Audio player */}
      {recordingUrl ? (
        <div>
          <audio
            controls
            preload="none"
            className="w-full rounded-lg"
            src={recordingUrl}
          >
            Your browser does not support the audio element.
          </audio>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-xs text-[#6B7280] underline hover:text-[#0A2818]"
          >
            {expanded ? "Hide details" : "Show details"}
          </button>
          {expanded && (
            <div className="mt-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-xs text-[#6B7280] space-y-1">
              <p><span className="font-medium">Call ID:</span> {callId}</p>
              <p><span className="font-medium">Status:</span> {STATUS_LABEL[callStatus] ?? callStatus}</p>
              {durationSeconds !== null && durationSeconds > 0 && (
                <p><span className="font-medium">Duration:</span> {formatDuration(durationSeconds)}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-[#6B7280]">
          {callStatus === "completed"
            ? "Recording is being processed..."
            : callStatus === "in_progress"
              ? "Call is in progress..."
              : callStatus === "initiated"
                ? "Call is being connected..."
                : "No recording available for this call."}
        </p>
      )}

      {/* Transcript — speaker-labelled, scrollable */}
      {(transcriptObject || transcript) && (
        <div>
          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            className="text-sm font-medium text-[#0A2818] underline hover:no-underline"
          >
            {showTranscript ? "Hide transcript" : "Show transcript"}
          </button>
          {showTranscript && (
            <div className="mt-2 max-h-96 overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white p-4 space-y-3">
              {transcriptObject && transcriptObject.length > 0 ? (
                transcriptObject.map((entry, i) => (
                  <div key={i} className="text-sm">
                    <span className={`font-semibold ${
                      entry.role === "agent" ? "text-emerald-700" : "text-[#0A2818]"
                    }`}>
                      {entry.role === "agent" ? "Alex (AI)" : "Lead"}:
                    </span>{" "}
                    <span className="text-[#374151]">{entry.content}</span>
                  </div>
                ))
              ) : transcript ? (
                <pre className="whitespace-pre-wrap text-sm text-[#374151]">{transcript}</pre>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
