// GET /api/cron/nurture — daily cron for expired lead nurture + second chance.

import { NextResponse } from "next/server";
import { processNurtureEmails, processSecondChanceEmails } from "@/lib/crm/nurture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [nurture, secondChance] = await Promise.all([
    processNurtureEmails(),
    processSecondChanceEmails(),
  ]);

  return NextResponse.json({
    ok: true,
    nurture,
    second_chance: secondChance,
  });
}
