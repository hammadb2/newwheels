// POST /api/crm/team — CEO-only. Adds a team member.

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email().max(254),
  display_name: z.string().min(1).max(120),
  role: z.enum(["ceo", "lead_qualifier", "community_outreach", "content_seo", "bdr", "platform_ops", "hr"]),
});

export async function POST(req: Request) {
  await requireTeam("ceo");
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const email = parsed.data.email.trim().toLowerCase();
  const { data: existing } = await supabase
    .from("team_members")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: false, error: "email_in_use" }, { status: 409 });

  const { error } = await supabase.from("team_members").insert({
    email,
    display_name: parsed.data.display_name,
    role: parsed.data.role,
    active: true,
  });
  if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
