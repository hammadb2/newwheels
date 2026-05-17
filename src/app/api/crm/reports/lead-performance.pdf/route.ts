// GET /api/crm/reports/lead-performance.pdf — branded PDF export.

import { NextResponse } from "next/server";
import { readSession } from "@/lib/crm/auth/session";
import { buildPdfHtml, pdfResponse } from "@/lib/crm/pdf-export";
import { defaultThisMonth, loadLeadPerformanceReport } from "@/lib/crm/reports/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readSession("crm");
  if (!session || session.subject.kind !== "team") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const report = await loadLeadPerformanceReport(defaultThisMonth());
  const now = new Date().toLocaleDateString("en-CA");

  const html = buildPdfHtml({
    title: "Lead Performance Report",
    date: now,
    sections: [
      {
        title: "Funnel Metrics",
        rows: [
          { label: "Received", value: String(report.received) },
          { label: "Qualified", value: String(report.qualified) },
          { label: "Sold", value: String(report.sold) },
          { label: "Expired", value: String(report.expired) },
          { label: "Qualification rate", value: `${report.qualification_rate.toFixed(1)}%` },
          { label: "Sale rate", value: `${report.sale_rate.toFixed(1)}%` },
          { label: "Expiry rate", value: `${report.expiry_rate.toFixed(1)}%` },
          { label: "Avg score", value: String(report.avg_score) },
        ],
      },
    ],
    tables: [
      {
        title: "Tier Distribution",
        headers: ["Tier", "Count", "Percentage"],
        rows: report.tier_distribution.map((t) => [t.tier, String(t.count), `${t.pct.toFixed(1)}%`]),
      },
    ],
  });

  return pdfResponse(html, `lead-performance-${now}.html`);
}
