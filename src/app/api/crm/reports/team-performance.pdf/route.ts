// GET /api/crm/reports/team-performance.pdf — branded PDF export.

import { NextResponse } from "next/server";
import { readSession } from "@/lib/crm/auth/session";
import { buildPdfHtml, pdfResponse } from "@/lib/crm/pdf-export";
import { defaultThisMonth, loadTeamPerformanceReport } from "@/lib/crm/reports/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readSession("crm");
  if (!session || session.subject.kind !== "team") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const report = await loadTeamPerformanceReport(defaultThisMonth());
  const now = new Date().toLocaleDateString("en-CA");

  const html = buildPdfHtml({
    title: "Team Performance Report",
    date: now,
    tables: [
      {
        title: "Team Members",
        headers: ["Name", "Role", "Qualified", "Unqualified", "Avg Score", "Avg Qual Min"],
        rows: report.members.map((m) => [
          m.name,
          m.role,
          String(m.qualified),
          String(m.unqualified),
          String(m.avg_score),
          String(m.avg_qual_minutes),
        ]),
      },
    ],
  });

  return pdfResponse(html, `team-performance-${now}.html`);
}
