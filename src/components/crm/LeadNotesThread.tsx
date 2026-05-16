"use client";

// Threaded internal notes UI for a lead. Renders the existing notes and
// (for writeable roles) a compose form. Replies are one-level (no nested
// threads) — the brief calls for a "lightweight threaded notes" view, not
// a full discussion tree.

import { useEffect, useMemo, useState, useTransition } from "react";
import { ROLE_LABEL, type TeamRole } from "@/lib/crm/types";

type ApiNote = {
  id: string;
  lead_id: string;
  author_team_member_id: string | null;
  author_display_name: string | null;
  author_role: TeamRole | null;
  parent_note_id: string | null;
  body: string;
  edited_at: string | null;
  created_at: string;
};

type Props = {
  leadId: string;
  initialNotes: ApiNote[];
  canWrite: boolean;
};

export function LeadNotesThread({ leadId, initialNotes, canWrite }: Props) {
  const [notes, setNotes] = useState<ApiNote[]>(initialNotes);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Re-fetch on visibility change so two qualifiers on the same lead see
  // each other's notes within a few seconds.
  useEffect(() => {
    function refresh() {
      void fetch(`/api/crm/leads/${leadId}/notes`, { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => {
          if (j?.ok && Array.isArray(j.notes)) setNotes(j.notes as ApiNote[]);
        })
        .catch(() => {});
    }
    function onVis() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [leadId]);

  const { roots, repliesByParent } = useMemo(() => {
    const r: ApiNote[] = [];
    const map = new Map<string, ApiNote[]>();
    for (const n of notes) {
      if (n.parent_note_id) {
        const list = map.get(n.parent_note_id) ?? [];
        list.push(n);
        map.set(n.parent_note_id, list);
      } else {
        r.push(n);
      }
    }
    return { roots: r, repliesByParent: map };
  }, [notes]);

  function submit(text: string, parentId: string | null) {
    if (text.trim().length === 0) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/crm/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, parent_note_id: parentId }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok: true; note_id: string }
        | { ok: false; error: string }
        | null;
      if (!res.ok || !json || !("ok" in json) || !json.ok) {
        setError(
          (json && "error" in json && json.error) || "Could not save your note. Try again."
        );
        return;
      }
      // Refetch to get the joined author info rather than synthesise it.
      const refreshed = await fetch(`/api/crm/leads/${leadId}/notes`, { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null);
      if (refreshed?.ok && Array.isArray(refreshed.notes)) {
        setNotes(refreshed.notes as ApiNote[]);
      }
      if (parentId) {
        setReplyBody("");
        setReplyTo(null);
      } else {
        setBody("");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2>Internal notes</h2>
        <span className="text-xs text-[#6B7280]">
          {notes.length === 0 ? "No notes yet" : `${notes.length} note${notes.length === 1 ? "" : "s"}`} · never shown to buyers
        </span>
      </div>

      {canWrite ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(body, null);
          }}
          className="space-y-2"
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={4000}
            rows={3}
            placeholder="Add a note for the team. Max 4000 characters."
            className="w-full rounded-lg border border-[#D9DDDC] bg-white px-3 py-2 text-sm text-[#0A2818] focus:border-[#0E3D24] focus:outline-none focus:ring-2 focus:ring-[#0E3D24]/20"
            aria-label="Add an internal note"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">{body.length}/4000</span>
            <button
              type="submit"
              disabled={pending || body.trim().length === 0}
              className="rounded-lg bg-[#0E3D24] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Saving…" : "Add note"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-[#6B7280]">Your role can read notes but not add them.</p>
      )}

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <ul className="space-y-3">
        {roots.length === 0 ? (
          <li className="rounded-lg border border-dashed border-[#D9DDDC] bg-[#F7F8F7] px-4 py-6 text-center text-sm text-[#6B7280]">
            No notes yet — be the first to add one.
          </li>
        ) : (
          roots.map((n) => (
            <li key={n.id} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
              <NoteHeader note={n} />
              <p className="mt-2 whitespace-pre-wrap text-sm text-[#0A2818]">{n.body}</p>
              {/* Replies */}
              <ul className="mt-3 space-y-2 border-l-2 border-[#E5E7EB] pl-3">
                {(repliesByParent.get(n.id) ?? []).map((reply) => (
                  <li key={reply.id}>
                    <NoteHeader note={reply} />
                    <p className="mt-1 whitespace-pre-wrap text-sm text-[#0A2818]">{reply.body}</p>
                  </li>
                ))}
              </ul>
              {/* Reply composer */}
              {canWrite ? (
                replyTo === n.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submit(replyBody, n.id);
                    }}
                    className="mt-3 space-y-2"
                  >
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      maxLength={4000}
                      rows={2}
                      placeholder="Reply…"
                      className="w-full rounded-lg border border-[#D9DDDC] bg-white px-3 py-2 text-sm text-[#0A2818] focus:border-[#0E3D24] focus:outline-none focus:ring-2 focus:ring-[#0E3D24]/20"
                      aria-label="Write a reply"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={pending || replyBody.trim().length === 0}
                        className="rounded-lg bg-[#0E3D24] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {pending ? "Saving…" : "Post reply"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(null);
                          setReplyBody("");
                        }}
                        className="text-xs text-[#6B7280] underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReplyTo(n.id)}
                    className="mt-3 text-xs text-[#0E3D24] underline"
                  >
                    Reply
                  </button>
                )
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function NoteHeader({ note }: { note: ApiNote }) {
  const author = note.author_display_name ?? "Unknown";
  const roleLabel = note.author_role ? ROLE_LABEL[note.author_role] : null;
  const ts = new Date(note.created_at);
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-[#6B7280]">
      <span>
        <strong className="text-[#0A2818]">{author}</strong>
        {roleLabel ? <span> · {roleLabel}</span> : null}
      </span>
      <time dateTime={note.created_at} title={ts.toISOString()}>
        {ts.toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}
        {note.edited_at ? " · edited" : null}
      </time>
    </div>
  );
}
