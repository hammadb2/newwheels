// POST /api/portal/filters — create a saved filter set.

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().min(1).max(120),
  filters: z.record(z.string()).refine((rec) => Object.keys(rec).length <= 20, "too many filters"),
});

export async function POST(req: Request) {
  const { subject } = await requireBuyer();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("saved_filters")
    .insert({
      buyer_id: subject.buyer_account_id,
      name: parsed.data.name,
      filters: parsed.data.filters,
    })
    .select("id, name, filters, created_at")
    .single();
  if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true, row: data });
}
