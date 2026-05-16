// POST /api/crm/outreach-log — upsert today's outreach log entry.

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  groups_posted_in: z.number().int().min(0).max(10000),
  dms_sent: z.number().int().min(0).max(10000),
  conversations_started: z.number().int().min(0).max(10000),
  form_submissions_attributed: z.number().int().min(0).max(10000),
  notes: z.string().max(500).nullable().optional(),
});

export async function POST(req: Request) {
  const { subject } = await requireTeam("community_outreach");
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { error } = await supabase
    .from("outreach_logs")
    .upsert(
      {
        team_member_id: subject.team_member_id,
        log_date: parsed.data.log_date,
        groups_posted_in: parsed.data.groups_posted_in,
        dms_sent: parsed.data.dms_sent,
        conversations_started: parsed.data.conversations_started,
        form_submissions_attributed: parsed.data.form_submissions_attributed,
        notes: parsed.data.notes ?? null,
      },
      { onConflict: "team_member_id,log_date" },
    );
  if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
