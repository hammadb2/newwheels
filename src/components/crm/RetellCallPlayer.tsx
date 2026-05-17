"use client";

// Audio player for Retell AI call recordings. Visible to CEO and Platform Ops
// only on the lead detail page.

import { useState } from "react";

type Props = {
  recordingUrl: string;
  callStatus: string;
  durationSeconds: number | null;
  callId: string;
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  no_answer: "No answer",
  voicemail: "Voicemail",
  failed: "Failed",
  in_progress: "In progress",
  scheduled: "Scheduled",
  error: "Error",
};

export function RetellCallPlayer({ recordingUrl, callStatus, durationSeconds, callId }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#0A2818]">Call recording</h2>
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                callStatus === "completed"
                  ? "bg-emerald-500"
                  : callStatus === "in_progress"
                    ? "bg-amber-500"
                    : "bg-red-400"
              }`}
            />
            {STATUS_LABEL[callStatus] ?? callStatus}
          </span>
          {durationSeconds !== null && durationSeconds > 0 && (
            <span className="text-[#6B7280]">{formatDuration(durationSeconds)}</span>
          )}
        </div>
      </div>

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
            : "No recording available for this call."}
        </p>
      )}
    </div>
  );
}
