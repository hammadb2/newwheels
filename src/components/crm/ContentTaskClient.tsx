"use client";

import { useState } from "react";

type Task = {
  id: string;
  task_kind: string;
  title: string;
  status: string;
  scheduled_for: string | null;
  completed_at: string | null;
  notes: string | null;
};

const KIND_LABEL: Record<string, string> = {
  blog_post: "Blog post",
  gbp_post: "GBP post",
  copy_change: "Copy change",
  directory_submission: "Directory submission",
};

export function ContentTaskClient({ tasks: initial }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function complete(id: string, note: string | null) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/crm/content-tasks/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note ?? null }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Update failed.");
        return;
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "completed", completed_at: new Date().toISOString(), notes: note ?? t.notes } : t)));
    } finally {
      setBusy(false);
    }
  }

  const open = tasks.filter((t) => t.status !== "completed");
  const done = tasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-700">{error}</p>}
      <section>
        <h2 className="text-lg font-extrabold text-[#0A2818] mb-2">Open tasks <span className="text-sm font-normal text-[#6B7280]">· {open.length}</span></h2>
        {open.length === 0 ? (
          <p className="text-sm text-[#6B7280]">All clear.</p>
        ) : (
          <ul className="divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] bg-white">
            {open.map((t) => (
              <li key={t.id} className="p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#6B7280]">{KIND_LABEL[t.task_kind] ?? t.task_kind}</p>
                  <p className="font-semibold text-[#0A2818]">{t.title}</p>
                  {t.scheduled_for ? <p className="text-xs text-[#6B7280]">Scheduled {new Date(t.scheduled_for).toLocaleDateString("en-CA")}</p> : null}
                  {t.notes ? <p className="text-xs text-[#6B7280] mt-1">{t.notes}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <UrlCompleteForm onSubmit={(note) => complete(t.id, note)} busy={busy} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-extrabold text-[#0A2818] mb-2">Completed <span className="text-sm font-normal text-[#6B7280]">· {done.length}</span></h2>
        {done.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No completed tasks yet.</p>
        ) : (
          <ul className="divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] bg-white">
            {done.map((t) => (
              <li key={t.id} className="p-4">
                <p className="text-xs uppercase tracking-wider text-[#6B7280]">{KIND_LABEL[t.task_kind] ?? t.task_kind}</p>
                <p className="font-semibold text-[#0A2818]">{t.title}</p>
                <p className="text-xs text-[#6B7280]">
                  Completed {t.completed_at ? new Date(t.completed_at).toLocaleDateString("en-CA") : ""}
                  {t.notes ? <> · {t.notes}</> : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function UrlCompleteForm({ onSubmit, busy }: { onSubmit: (note: string | null) => void; busy: boolean }) {
  const [note, setNote] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(note.trim() || null); }}
      className="flex items-center gap-2"
    >
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Result link or note (optional)" className="portal-input text-xs" style={{ maxWidth: 220 }} />
      <button className="btn-primary text-xs" disabled={busy}>Mark complete</button>
    </form>
  );
}
