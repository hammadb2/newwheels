// POST /api/portal/account/budget — dealer master updates their monthly budget.

import { NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/crm/auth/session";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ monthly_budget_cents: z.number().int().min(0).max(1_000_000_00) });

export async function POST(req: Request) {
  const session = await readSession("portal");
  if (!session || session.subject.kind !== "buyer" || session.subject.buyer_kind !== "dealer_master") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { error } = await supabase
    .from("buyer_accounts")
    .update({ monthly_budget_cents: parsed.data.monthly_budget_cents })
    .eq("id", session.subject.buyer_account_id);
  if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
