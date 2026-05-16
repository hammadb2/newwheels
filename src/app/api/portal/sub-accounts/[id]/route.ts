// DELETE /api/portal/sub-accounts/:id — soft-delete a dealer sub-account.

import { NextResponse } from "next/server";
import { readSession } from "@/lib/crm/auth/session";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await readSession("portal");
  if (!session || session.subject.kind !== "buyer" || session.subject.buyer_kind !== "dealer_master") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: row } = await supabase
    .from("buyer_sub_accounts")
    .select("id, master_buyer_id, buyer_account_id")
    .eq("id", id)
    .single();
  if (!row || row.master_buyer_id !== session.subject.buyer_account_id) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  await supabase.from("buyer_sub_accounts").delete().eq("id", id);
  // Suspend the sub-buyer account so it cannot log in any more.
  await supabase.from("buyer_accounts").update({ status: "suspended" }).eq("id", row.buyer_account_id as string);
  return NextResponse.json({ ok: true });
}
