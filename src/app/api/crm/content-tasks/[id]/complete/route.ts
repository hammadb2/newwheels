// POST /api/crm/content-tasks/:id/complete — mark a content task complete.

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ note: z.string().max(500).nullable().optional() });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { subject } = await requireTeam("content_seo");
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: task } = await supabase
    .from("content_tasks")
    .select("id, team_member_id, notes")
    .eq("id", id)
    .single();
  if (!task) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  if (task.team_member_id !== subject.team_member_id && subject.role !== "ceo") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const updateFields: Record<string, unknown> = {
    status: "completed",
    completed_at: new Date().toISOString(),
  };
  if (parsed.data.note) {
    const prev = (task.notes as string | null) ?? "";
    updateFields.notes = prev ? `${prev}\n${parsed.data.note}` : parsed.data.note;
  }

  const { error } = await supabase
    .from("content_tasks")
    .update(updateFields)
    .eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
