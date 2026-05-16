// Server helpers for the lead_notes thread.
//
// All access is gated by the RLS policies on nw.lead_notes, but we re-check
// in application code too because we connect with the service-role key. The
// goal is: a Lead Qualifier can only manipulate notes for leads they're
// assigned to (or unassigned leads); CEO + Platform Ops can manipulate any
// note; HR + BDR are read-only.

import { getServerSupabase } from "@/lib/crm/supabase/server";
import type { TeamRole } from "@/lib/crm/types";

export type LeadNoteRow = {
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

const NOTE_MAX_LENGTH = 4000;

export function canReadLeadNotes(role: TeamRole): boolean {
  return (
    role === "ceo" ||
    role === "platform_ops" ||
    role === "lead_qualifier" ||
    role === "bdr" ||
    role === "hr"
  );
}

export function canWriteLeadNotes(role: TeamRole): boolean {
  return role === "ceo" || role === "platform_ops" || role === "lead_qualifier";
}

export async function listLeadNotes(leadId: string): Promise<LeadNoteRow[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("lead_notes")
    .select(
      "id, lead_id, author_team_member_id, parent_note_id, body, edited_at, created_at, author:author_team_member_id(display_name, role)"
    )
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("listLeadNotes failed", error);
    return [];
  }
  // Supabase returns a joined record as an array when the join target is
  // a single foreign-key relation, so we normalise both shapes here.
  type AuthorJoin =
    | { display_name: string | null; role: TeamRole | null }
    | { display_name: string | null; role: TeamRole | null }[]
    | null;
  type Row = Omit<LeadNoteRow, "author_display_name" | "author_role"> & { author: AuthorJoin };
  const rows = (data as Row[] | null) ?? [];
  return rows.map((r) => {
    const author = Array.isArray(r.author) ? r.author[0] ?? null : r.author;
    return {
      id: r.id,
      lead_id: r.lead_id,
      author_team_member_id: r.author_team_member_id,
      parent_note_id: r.parent_note_id,
      body: r.body,
      edited_at: r.edited_at,
      created_at: r.created_at,
      author_display_name: author?.display_name ?? null,
      author_role: author?.role ?? null,
    };
  });
}

export type AddLeadNoteResult =
  | { ok: true; note_id: string }
  | { ok: false; error: "not_configured" | "validation" | "forbidden" | "db_error" };

export async function addLeadNote(opts: {
  lead_id: string;
  author_team_member_id: string;
  author_role: TeamRole;
  body: string;
  parent_note_id?: string | null;
}): Promise<AddLeadNoteResult> {
  if (!canWriteLeadNotes(opts.author_role)) return { ok: false, error: "forbidden" };
  const body = opts.body.trim();
  if (body.length === 0 || body.length > NOTE_MAX_LENGTH) {
    return { ok: false, error: "validation" };
  }
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "not_configured" };

  // If a parent_note_id is provided, ensure it belongs to the same lead so
  // we don't accidentally splice a reply across leads.
  if (opts.parent_note_id) {
    const { data: parent } = await supabase
      .from("lead_notes")
      .select("lead_id")
      .eq("id", opts.parent_note_id)
      .maybeSingle();
    if (!parent || parent.lead_id !== opts.lead_id) {
      return { ok: false, error: "validation" };
    }
  }

  const { data, error } = await supabase
    .from("lead_notes")
    .insert({
      lead_id: opts.lead_id,
      author_team_member_id: opts.author_team_member_id,
      parent_note_id: opts.parent_note_id ?? null,
      body,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("addLeadNote insert failed", error);
    return { ok: false, error: "db_error" };
  }
  return { ok: true, note_id: data.id as string };
}
