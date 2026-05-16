"use client";

import { useState } from "react";

export function ComposeClient({ fromEmail }: { fromEmail: string }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/crm/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_email: fromEmail,
          to_email: to.trim(),
          subject: subject.trim(),
          body_text: body,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Send failed.");
        return;
      }
      window.location.href = `/crm/inbox/${json.thread_id}`;
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={send} className="crm-card space-y-3">
      <p className="text-sm text-[#6B7280]">From <strong>{fromEmail || "your mailbox"}</strong></p>
      <label className="block">
        <span className="block text-sm font-semibold text-[#0A2818] mb-1">To</span>
        <input type="email" required className="crm-input" value={to} onChange={(e) => setTo(e.target.value)} />
      </label>
      <label className="block">
        <span className="block text-sm font-semibold text-[#0A2818] mb-1">Subject</span>
        <input type="text" required maxLength={200} className="crm-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </label>
      <label className="block">
        <span className="block text-sm font-semibold text-[#0A2818] mb-1">Message</span>
        <textarea className="crm-textarea" rows={10} required value={body} onChange={(e) => setBody(e.target.value)} />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" className="crm-btn" disabled={busy}>{busy ? "Sending…" : "Send"}</button>
    </form>
  );
}
