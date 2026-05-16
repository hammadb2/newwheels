// DELETE /api/portal/filters/:id — delete a saved filter.

import { NextResponse } from "next/server";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { subject } = await requireBuyer();
  const { id } = await ctx.params;
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  const { error } = await supabase
    .from("saved_filters")
    .delete()
    .eq("id", id)
    .eq("buyer_id", subject.buyer_account_id);
  if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
