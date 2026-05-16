// GET /api/cron/pricing-update
//
// Walks every `available` lead and recomputes its current price using the
// pricing curve. Intended to run every hour (idempotent — recomputes from
// available_at, doesn't depend on previous state).

import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/crm/cron";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { currentPriceFor } from "@/lib/crm/pricing";
import type { LeadTier } from "@/lib/crm/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!authorizeCron(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: rows } = await supabase
    .from("leads")
    .select("id, tier, available_at, current_price_cents")
    .eq("status", "available");

  const now = new Date();
  let updated = 0;
  for (const r of rows ?? []) {
    const tier = (r.tier as LeadTier) ?? "standard";
    const price = currentPriceFor({ tier, available_at: new Date(r.available_at as string), now });
    if (price.expired) continue;
    if (price.price_cents !== r.current_price_cents) {
      await supabase
        .from("leads")
        .update({
          current_price_cents: price.price_cents,
          pricing_updated_at: now.toISOString(),
        })
        .eq("id", r.id);
      updated += 1;
    }
  }
  return NextResponse.json({ ok: true, updated });
}
