"use client";

// Approve / Reject buttons + rejection reason dropdown.

import { useState } from "react";

const REJECTION_REASONS = [
  ["invalid_amvic", "Invalid AMVIC licence"],
  ["id_mismatch", "ID does not match contact"],
  ["incomplete_documents", "Incomplete documents"],
  ["other", "Other"],
] as const;

export function VerificationDecisionClient({ buyerId }: { buyerId: string }) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState<typeof REJECTION_REASONS[number][0]>("incomplete_documents");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: "approved" | "rejected") {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/crm/verifications/${buyerId}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, rejection_reason: decision === "rejected" ? reason : undefined }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Decision failed.");
        return;
      }
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="crm-card space-y-3">
      <h2>Decision</h2>
      <div className="flex flex-wrap gap-3">
        <button className="crm-btn" disabled={busy} onClick={() => decide("approved")}>
          {busy ? "Working…" : "Approve"}
        </button>
        <button className="crm-btn crm-btn-danger" disabled={busy} onClick={() => setShowReject((s) => !s)}>
          Reject
        </button>
      </div>
      {showReject && (
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <label className="block text-sm font-semibold text-[#0A2818]">Reason</label>
          <select
            className="crm-select"
            value={reason}
            onChange={(e) => setReason(e.target.value as typeof reason)}
          >
            {REJECTION_REASONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button className="crm-btn crm-btn-danger" disabled={busy} onClick={() => decide("rejected")}>
            {busy ? "Working…" : "Confirm rejection"}
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
