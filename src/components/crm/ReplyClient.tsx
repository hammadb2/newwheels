"use client";

import { useState } from "react";

export function ReplyClient({ threadId, ownerEmail, subject, leadId }: {
  threadId: string; ownerEmail: string; subject: string; leadId: string | null;
}) {
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/crm/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId,
          from_email: ownerEmail,
          to_email: to.trim(),
          subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
          body_text: body,
          lead_id: leadId,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Send failed.");
        return;
      }
      setDone(true);
      setBody("");
      setTimeout(() => window.location.reload(), 500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={send} className="crm-card space-y-3">
      <h2>Reply</h2>
      <label className="block">
        <span className="block text-sm font-semibold text-[#0A2818] mb-1">To</span>
        <input type="email" required className="crm-input" value={to} onChange={(e) => setTo(e.target.value)} />
      </label>
      <label className="block">
        <span className="block text-sm font-semibold text-[#0A2818] mb-1">Message</span>
        <textarea className="crm-textarea" rows={6} required value={body} onChange={(e) => setBody(e.target.value)} />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {done && <p className="text-sm text-green-700">Sent.</p>}
      <button type="submit" className="crm-btn" disabled={busy}>{busy ? "Sending…" : "Send"}</button>
    </form>
  );
}
