// POST /api/crm/ai/search — natural language lead search.
//
// CEO types plain English, Claude converts to Supabase query.

import { NextResponse } from "next/server";
import { readSession } from "@/lib/crm/auth/session";
import { naturalLanguageSearch } from "@/lib/crm/ai-features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await readSession("crm");
  if (!session || session.subject.kind !== "team" || session.subject.role !== "ceo") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let body: { query?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.query || typeof body.query !== "string") {
    return NextResponse.json({ ok: false, error: "missing_query" }, { status: 400 });
  }

  const result = await naturalLanguageSearch(body.query);
  return NextResponse.json({ ok: true, ...result });
}
