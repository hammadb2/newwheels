// POST /api/crm/lead-intake — public endpoint hit by the newwheels.ca form.
//
// Accepts the same shape that /api/lead already uses so we can wire both in
// parallel for a zero-downtime cutover. Idempotency is provided by the
// duplicate-detection window inside `intakeLead`.
//
// This endpoint is not authenticated. We rate-limit by IP at the edge / WAF.

import { NextResponse } from "next/server";
import { z } from "zod";
import { intakeLead } from "@/lib/crm/leads/intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  first_name: z.string().trim().min(1).max(80).optional(),
  last_name: z.string().trim().min(1).max(80).optional(),
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  email: z.string().email().max(254),
  phone: z.string().trim().min(7).max(40),
  source_page: z.string().max(500).optional(),
  sourcePage: z.string().max(500).optional(),
  source_channel: z.string().max(80).optional(),
  raw_payload: z.record(z.unknown()).optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const first_name = parsed.data.first_name ?? parsed.data.firstName ?? "";
  const last_name = parsed.data.last_name ?? parsed.data.lastName ?? "";
  const source_page = parsed.data.source_page ?? parsed.data.sourcePage ?? null;
  if (!first_name || !last_name) {
    return NextResponse.json(
      { ok: false, error: "missing_name" },
      { status: 400 },
    );
  }

  const result = await intakeLead({
    first_name,
    last_name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    source_page,
    source_channel: parsed.data.source_channel ?? null,
    raw_payload: parsed.data.raw_payload ?? (typeof json === "object" && json !== null ? (json as Record<string, unknown>) : {}),
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}
