// POST /api/crm/leads/:id/notes — add a new note to a lead's internal thread.
// GET  /api/crm/leads/:id/notes — list notes for a lead.
//
// Visibility is enforced by both the RLS policies on nw.lead_notes and the
// canReadLeadNotes / canWriteLeadNotes helpers. Buyers cannot reach this
// route — the path lives under /api/crm/* which is gated by the CRM session
// cookie.

import { NextResponse } from "next/server";
import { requireTeam } from "@/lib/crm/auth/rbac";
import {
  addLeadNote,
  canReadLeadNotes,
  canWriteLeadNotes,
  listLeadNotes,
} from "@/lib/crm/leads/notes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { subject } = await requireTeam("any_team");
  if (!canReadLeadNotes(subject.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const notes = await listLeadNotes(id);
  return NextResponse.json({ ok: true, notes });
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { subject } = await requireTeam("any_team");
  if (!canWriteLeadNotes(subject.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  let payload: { body?: unknown; parent_note_id?: unknown };
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const body = typeof payload.body === "string" ? payload.body : "";
  const parent_note_id =
    typeof payload.parent_note_id === "string" && payload.parent_note_id.length > 0
      ? payload.parent_note_id
      : null;

  const result = await addLeadNote({
    lead_id: id,
    author_team_member_id: subject.team_member_id,
    author_role: subject.role,
    body,
    parent_note_id,
  });
  if (!result.ok) {
    const status = result.error === "validation" ? 400 : result.error === "forbidden" ? 403 : 500;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }
  return NextResponse.json({ ok: true, note_id: result.note_id }, { status: 201 });
}
