// POST /api/crm/leads/:id/equifax — run Equifax soft pull (mock).
//
// Updates credit_bracket on the lead record. Mock implementation
// that is clearly flagged and swappable without architectural changes.

import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { softPullCredit } from "@/lib/crm/equifax-mock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("id, first_name, last_name, raw_payload")
    .eq("id", id)
    .single();

  if (!lead) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const payload = (lead.raw_payload as Record<string, unknown>) ?? {};

  const result = await softPullCredit({
    first_name: (lead.first_name as string) ?? "",
    last_name: (lead.last_name as string) ?? "",
    date_of_birth: (payload.date_of_birth as string) ?? "",
    address: (payload.address as string) ?? "",
  });

  await supabase
    .from("leads")
    .update({ credit_bracket: result.credit_bracket })
    .eq("id", id);

  return NextResponse.json({ ok: true, ...result });
}
