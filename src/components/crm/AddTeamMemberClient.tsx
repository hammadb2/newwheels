"use client";

import { useState } from "react";
import { ROLE_LABEL } from "@/lib/crm/types";
import type { TeamRole } from "@/lib/crm/types";

const ROLES: readonly TeamRole[] = [
  "ceo",
  "lead_qualifier",
  "community_outreach",
  "content_seo",
  "bdr",
  "platform_ops",
  "hr",
] as const;

export function AddTeamMemberClient() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<TeamRole>("lead_qualifier");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/crm/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), display_name: name.trim(), role }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Couldn't add team member.");
        return;
      }
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="crm-btn" onClick={() => setOpen(true)}>
        + Add team member
      </button>
    );
  }

  return (
    <form onSubmit={add} className="crm-card space-y-3">
      <h2>Add team member</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="block">
          <span className="block text-sm font-semibold text-[#0A2818] mb-1">Display name</span>
          <input className="crm-input" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-[#0A2818] mb-1">Email</span>
          <input type="email" required className="crm-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="someone@team.newwheels.ca" />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-[#0A2818] mb-1">Role</span>
          <select className="crm-select" value={role} onChange={(e) => setRole(e.target.value as TeamRole)}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        </label>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="crm-btn" disabled={busy}>{busy ? "Adding…" : "Add"}</button>
        <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
