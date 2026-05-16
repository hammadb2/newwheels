// POST /api/crm/team/:id/toggle — CEO-only. Flips active flag for a team member.

import { NextResponse } from "next/server";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireTeam("ceo");
  const { id } = await ctx.params;
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: row } = await supabase.from("team_members").select("active").eq("id", id).single();
  if (!row) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await supabase.from("team_members").update({ active: !row.active }).eq("id", id);

  const crmUrl = (process.env.NW_CRM_URL || "https://crm.newwheels.ca").replace(/\/$/, "");
  return NextResponse.redirect(`${crmUrl}/crm/admin/team`, 303);
}
