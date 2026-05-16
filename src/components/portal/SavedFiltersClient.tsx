"use client";

// Compact saved-filter editor. Stores filter sets server-side via
// /api/portal/filters. We deliberately keep the schema simple: a `name` and
// a `filters` JSON object whose keys match the marketplace querystring.

import { useState } from "react";
import {
  BODY_TYPE_OPTIONS,
  DOWN_PAYMENT_OPTIONS,
  PURCHASE_TIMELINE_OPTIONS,
  TOTAL_BUDGET_OPTIONS,
  VISA_OPTIONS,
} from "@/lib/crm/types";

type Filter = { id: string; name: string; filters: Record<string, string>; created_at: string };

export function SavedFiltersClient({ initial }: { initial: Filter[] }) {
  const [list, setList] = useState<Filter[]>(initial);
  const [name, setName] = useState("");
  const [tier, setTier] = useState("all");
  const [body, setBody] = useState("all");
  const [visa, setVisa] = useState("all");
  const [budget, setBudget] = useState("all");
  const [down, setDown] = useState("all");
  const [tl, setTl] = useState("all");
  const [credit, setCredit] = useState("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setBusy(true);
    try {
      const filters = { tier, body, visa, budget, down, tl, credit };
      const res = await fetch("/api/portal/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), filters }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Couldn't save filter.");
        return;
      }
      setList((prev) => [json.row as Filter, ...prev]);
      setName("");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/portal/filters/${id}`, { method: "DELETE" });
      setList((prev) => prev.filter((f) => f.id !== id));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-sm font-semibold text-[#0A2818] mb-1">Filter name</span>
            <input className="portal-input" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Calgary SUV ASAP" />
          </label>
          <Select label="Tier" value={tier} onChange={setTier} options={[["all", "All"], ["hot", "Hot"], ["warm", "Warm"], ["standard", "Standard"]]} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Select label="Credit" value={credit} onChange={setCredit} options={[["all", "All"], ["good", "Good"], ["fair", "Fair"], ["poor", "Poor"]]} />
          <Select label="Body" value={body} onChange={setBody} options={[["all", "All"], ...BODY_TYPE_OPTIONS.map((o) => [o.value, o.label] as [string, string])]} />
          <Select label="Visa" value={visa} onChange={setVisa} options={[["all", "All"], ...VISA_OPTIONS.map((o) => [o.value, o.label] as [string, string])]} />
          <Select label="Budget" value={budget} onChange={setBudget} options={[["all", "All"], ...TOTAL_BUDGET_OPTIONS.map((o) => [o.value, o.label] as [string, string])]} />
          <Select label="Down" value={down} onChange={setDown} options={[["all", "All"], ...DOWN_PAYMENT_OPTIONS.map((o) => [o.value, o.label] as [string, string])]} />
          <Select label="Timeline" value={tl} onChange={setTl} options={[["all", "All"], ...PURCHASE_TIMELINE_OPTIONS.map((o) => [o.value, o.label] as [string, string])]} />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save filter"}</button>
      </form>

      {list.length === 0 ? (
        <p className="text-sm text-[#6B7280]">No saved filters yet.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((f) => (
            <li key={f.id} className="rounded-xl border border-[#E5E7EB] bg-white p-4 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-[#0A2818]">{f.name}</p>
                <p className="text-xs text-[#6B7280]">
                  {Object.entries(f.filters)
                    .filter(([, v]) => v && v !== "all")
                    .map(([k, v]) => `${k}=${v}`)
                    .join(" · ") || "All leads"}
                </p>
              </div>
              <button onClick={() => remove(f.id)} className="text-sm text-red-700 underline" disabled={busy}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: readonly [string, string][];
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[#0A2818] mb-1">{label}</span>
      <select className="portal-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
