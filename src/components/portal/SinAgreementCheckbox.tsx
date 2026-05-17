"use client";

import { useState } from "react";

export function SinAgreementCheckbox({
  alreadySigned,
}: {
  alreadySigned: boolean;
}) {
  const [signed, setSigned] = useState(alreadySigned);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSign() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/account/sin-agreement", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Failed to sign agreement");
        return;
      }
      setSigned(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (signed) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Data sharing agreement signed
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#E5E1D8] bg-[#FAF7F0] px-4 py-3 space-y-3">
      <p className="text-sm font-semibold text-[#0A2818]">Data Sharing Agreement</p>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          onChange={handleSign}
          disabled={loading}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-[#155235] focus:ring-[#155235]"
        />
        <span className="text-xs text-[#0A2818] leading-relaxed">
          I agree to use the SIN solely for credit inquiry for the specific applicant
          in compliance with PIPEDA. I understand that any other use is a violation of
          federal privacy law and may result in account suspension.
        </span>
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
