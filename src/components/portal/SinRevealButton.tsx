"use client";

import { useState } from "react";

export function BuyerSinRevealButton({
  purchaseId,
  masked,
  agreementSigned,
}: {
  purchaseId: string;
  masked: string;
  agreementSigned: boolean;
}) {
  const [sin, setSin] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReveal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/purchases/${purchaseId}/sin-reveal`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error === "agreement_required"
          ? "You must sign the data sharing agreement before viewing SIN"
          : data.error ?? "Failed to reveal SIN");
        return;
      }
      setSin(data.sin as string);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (!agreementSigned) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-lg font-bold text-[#0A2818]">
        {sin ?? masked}
      </span>
      {!sin && (
        <button
          onClick={handleReveal}
          disabled={loading}
          className="rounded-lg bg-[#0A2818] px-3 py-1.5 text-xs font-semibold text-[#D9FF4E] hover:bg-[#155235] disabled:opacity-50"
        >
          {loading ? "Revealing\u2026" : "Reveal SIN"}
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
