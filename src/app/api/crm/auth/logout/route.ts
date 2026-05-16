// POST /api/crm/auth/logout — revoke + clear the cookie.

import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/crm/auth/cookies";
import { revokeSession } from "@/lib/crm/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await revokeSession("crm");
  await clearSessionCookie("crm");
  return NextResponse.json({ ok: true });
}
