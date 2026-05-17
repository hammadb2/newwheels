// GET /api/cron/feedback — daily cron for dealer close rate feedback emails.

import { NextResponse } from "next/server";
import { processFeedbackEmails } from "@/lib/crm/feedback-loop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await processFeedbackEmails();
  return NextResponse.json({ ok: true, ...result });
}
