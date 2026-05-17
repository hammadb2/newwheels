"use client";

import { useState } from "react";

export function LeadPriceOverride({
  leadId,
  currentPriceCents,
  overrideCents,
}: {
  leadId: string;
  currentPriceCents: number | null;
  overrideCents: number | null;
}) {
  const [editing, setEditing] = useState(false);
  const [dollars, setDollars] = useState(
    overrideCents != null ? String(overrideCents / 100) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [override, setOverride] = useState(overrideCents);

  const isOverridden = override != null;

  async function handleSave() {
    const parsed = Number(dollars);
    if (isNaN(parsed) || parsed < 0) {
      setError("Enter a valid dollar amount");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/set-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_cents: Math.round(parsed * 100) }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Failed to set price");
        return;
      }
      setOverride(Math.round(parsed * 100));
      setEditing(false);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/set-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_cents: null }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Failed to clear override");
        return;
      }
      setOverride(null);
      setDollars("");
      setEditing(false);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#6B7280]">
          Set price (CAD)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#0A2818]">$</span>
          <input
            type="number"
            min="0"
            step="1"
            value={dollars}
            onChange={(e) => setDollars(e.target.value)}
            className="w-28 rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-sm font-semibold text-[#0A2818] focus:border-[#155235] focus:outline-none focus:ring-1 focus:ring-[#155235]"
            placeholder={currentPriceCents != null ? String(currentPriceCents / 100) : "0"}
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[#0A2818] px-3 py-2 text-xs font-semibold text-[#D9FF4E] hover:bg-[#155235] disabled:opacity-50"
          >
            {saving ? "Saving\u2026" : "Save"}
          </button>
          <button
            onClick={() => { setEditing(false); setError(null); }}
            className="rounded-lg border border-[#E5E1D8] px-3 py-2 text-xs font-semibold text-[#6B7280] hover:bg-[#FAF7F0]"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        {isOverridden && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Manual override
          </span>
        )}
        <button
          onClick={() => {
            setDollars(
              override != null
                ? String(override / 100)
                : currentPriceCents != null
                  ? String(currentPriceCents / 100)
                  : "",
            );
            setEditing(true);
          }}
          className="text-xs font-semibold text-[#155235] underline hover:text-[#0A2818]"
        >
          {isOverridden ? "Change price" : "Set manual price"}
        </button>
        {isOverridden && (
          <button
            onClick={handleClear}
            disabled={saving}
            className="text-xs font-semibold text-red-600 underline hover:text-red-800 disabled:opacity-50"
          >
            {saving ? "Clearing\u2026" : "Revert to auto"}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
