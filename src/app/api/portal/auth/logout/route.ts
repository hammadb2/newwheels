import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/crm/auth/cookies";
import { revokeSession } from "@/lib/crm/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await revokeSession("portal");
  await clearSessionCookie("portal");
  return NextResponse.json({ ok: true });
}
