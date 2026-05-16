"use client";

// Dealer master UI for setting their monthly budget + managing sub-accounts.

import { useState } from "react";

export type SubRow = {
  id: string;
  name: string;
  contact_email: string;
  monthly_budget_cents: number;
  current_month_spent_cents: number;
  invoice_name: string | null;
};

export function SubAccountsClient({ initialSubs, masterMonthlyBudgetCents }: {
  initialSubs: SubRow[];
  masterMonthlyBudgetCents: number;
}) {
  const [subs, setSubs] = useState(initialSubs);
  const [budget, setBudget] = useState((masterMonthlyBudgetCents / 100).toString());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Add sub-account form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newInvoice, setNewInvoice] = useState("");
  const [newBudget, setNewBudget] = useState("");

  async function saveBudget(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const dollars = parseFloat(budget);
      if (!Number.isFinite(dollars) || dollars < 0) {
        setError("Budget must be a positive number.");
        return;
      }
      const res = await fetch("/api/portal/account/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthly_budget_cents: Math.round(dollars * 100) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) setError(json?.error || "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function addSub(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const dollars = parseFloat(newBudget || "0");
      const res = await fetch("/api/portal/sub-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          contact_email: newEmail.trim(),
          invoice_name: newInvoice.trim() || null,
          monthly_budget_cents: Math.round((Number.isFinite(dollars) ? dollars : 0) * 100),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Add failed.");
        return;
      }
      setSubs((prev) => [json.row as SubRow, ...prev]);
      setNewName(""); setNewEmail(""); setNewInvoice(""); setNewBudget("");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSub(id: string) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/portal/sub-accounts/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Delete failed.");
        return;
      }
      setSubs((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Sub-accounts</h1>

      <form onSubmit={saveBudget} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-3">
        <h2 className="font-extrabold text-[#0A2818]">Master monthly budget</h2>
        <p className="text-sm text-[#6B7280]">Soft cap for the entire dealer master account. Adjustable any time.</p>
        <label className="block max-w-sm">
          <span className="block text-sm font-semibold text-[#0A2818] mb-1">Budget (CAD)</span>
          <input className="portal-input" type="number" min={0} step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </label>
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save budget"}</button>
      </form>

      <form onSubmit={addSub} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-3">
        <h2 className="font-extrabold text-[#0A2818]">Add sub-account</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block"><span className="block text-sm font-semibold text-[#0A2818] mb-1">Name (e.g. Finance Manager 1)</span>
            <input className="portal-input" required value={newName} onChange={(e) => setNewName(e.target.value)} /></label>
          <label className="block"><span className="block text-sm font-semibold text-[#0A2818] mb-1">Contact email</span>
            <input className="portal-input" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></label>
          <label className="block"><span className="block text-sm font-semibold text-[#0A2818] mb-1">Invoice name (optional)</span>
            <input className="portal-input" value={newInvoice} onChange={(e) => setNewInvoice(e.target.value)} /></label>
          <label className="block"><span className="block text-sm font-semibold text-[#0A2818] mb-1">Monthly budget (CAD)</span>
            <input className="portal-input" type="number" min={0} step="0.01" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} /></label>
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Adding…" : "Add sub-account"}</button>
      </form>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-3">
        <h2 className="font-extrabold text-[#0A2818]">Existing sub-accounts</h2>
        {subs.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No sub-accounts yet.</p>
        ) : (
          <ul className="space-y-2">
            {subs.map((s) => {
              const allocated = s.monthly_budget_cents;
              const spent = s.current_month_spent_cents;
              const remaining = allocated - spent;
              const pct = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
              return (
                <li key={s.id} className="rounded-lg border border-[#E5E7EB] p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#0A2818]">{s.name}</p>
                      <p className="text-xs text-[#6B7280]">{s.contact_email}{s.invoice_name ? ` · Invoice: ${s.invoice_name}` : ""}</p>
                    </div>
                    <button onClick={() => deleteSub(s.id)} className="text-xs underline text-red-700" disabled={busy}>Remove</button>
                  </div>
                  <div className="mt-2 text-xs text-[#6B7280]">
                    Spent ${(spent / 100).toFixed(2)} of ${(allocated / 100).toFixed(2)} — ${(remaining / 100).toFixed(2)} remaining
                  </div>
                  <div className="mt-1 h-2 w-full rounded bg-[#E5E7EB] overflow-hidden">
                    <div className="h-full bg-[#0A2818]" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
