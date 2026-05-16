// POST /api/portal/sub-accounts — dealer master creates a sub-account.

import { NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/crm/auth/session";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().trim().min(1).max(120),
  contact_email: z.string().email().max(254),
  invoice_name: z.string().trim().min(1).max(120).nullable().optional(),
  monthly_budget_cents: z.number().int().min(0).max(1_000_000_00).optional(),
});

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

  // Sub-account is also stored as a buyer_account of kind dealer_sub so it
  // can sign in independently and inherit verification from the master.
  const { data: subBuyer, error: e1 } = await supabase
    .from("buyer_accounts")
    .insert({
      kind: "dealer_sub",
      status: "active",
      master_buyer_id: session.subject.buyer_account_id,
      contact_name: parsed.data.name,
      email: parsed.data.contact_email.trim().toLowerCase(),
      verified_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (e1 || !subBuyer) {
    if (e1?.message?.includes("duplicate")) {
      return NextResponse.json({ ok: false, error: "email_in_use" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  const { data: subRow, error: e2 } = await supabase
    .from("buyer_sub_accounts")
    .insert({
      master_buyer_id: session.subject.buyer_account_id,
      buyer_account_id: subBuyer.id as string,
      name: parsed.data.name,
      contact_email: parsed.data.contact_email.trim().toLowerCase(),
      invoice_name: parsed.data.invoice_name ?? null,
      monthly_budget_cents: parsed.data.monthly_budget_cents ?? 0,
      current_month_spent_cents: 0,
    })
    .select("id, name, contact_email, monthly_budget_cents, current_month_spent_cents, invoice_name")
    .single();
  if (e2 || !subRow) {
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, row: subRow });
}
