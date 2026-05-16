"use client";

import { useState } from "react";

type Initial = {
  log_date: string;
  groups_posted_in: number;
  dms_sent: number;
  conversations_started: number;
  form_submissions_attributed: number;
  notes: string | null;
} | null;

export function OutreachLogClient({ today, initial }: { today: string; initial: Initial }) {
  const [groups, setGroups] = useState(String(initial?.groups_posted_in ?? 0));
  const [dms, setDms] = useState(String(initial?.dms_sent ?? 0));
  const [conv, setConv] = useState(String(initial?.conversations_started ?? 0));
  const [forms, setForms] = useState(String(initial?.form_submissions_attributed ?? 0));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/crm/outreach-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          log_date: today,
          groups_posted_in: Number(groups) || 0,
          dms_sent: Number(dms) || 0,
          conversations_started: Number(conv) || 0,
          form_submissions_attributed: Number(forms) || 0,
          notes: notes.trim() || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) setMsg(json?.error || "Save failed.");
      else setMsg("Saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-3">
      <h2 className="font-extrabold text-[#0A2818]">Today — {today}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <NumField label="Groups posted in" value={groups} onChange={setGroups} />
        <NumField label="DMs sent" value={dms} onChange={setDms} />
        <NumField label="Conversations started" value={conv} onChange={setConv} />
        <NumField label="Form submissions attributed" value={forms} onChange={setForms} />
      </div>
      <label className="block">
        <span className="block text-sm font-semibold text-[#0A2818] mb-1">Notes</span>
        <textarea className="portal-input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
      </label>
      {msg && <p className="text-sm text-[#0A2818]">{msg}</p>}
      <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
    </form>
  );
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[#0A2818] mb-1">{label}</span>
      <input type="number" min={0} value={value} onChange={(e) => onChange(e.target.value)} className="portal-input" />
    </label>
  );
}
