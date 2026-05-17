// GET /api/crm/reports/revenue.pdf — branded PDF export of revenue report.

import { NextResponse } from "next/server";
import { readSession } from "@/lib/crm/auth/session";
import { buildPdfHtml, pdfResponse } from "@/lib/crm/pdf-export";
import { defaultThisMonth, loadRevenueReport } from "@/lib/crm/reports/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cents(v: number): string {
  return `$${(v / 100).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`;
}

export async function GET() {
  const session = await readSession("crm");
  if (!session || session.subject.kind !== "team") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const report = await loadRevenueReport(defaultThisMonth());
  const now = new Date().toLocaleDateString("en-CA");

  const html = buildPdfHtml({
    title: "Revenue Report",
    date: now,
    sections: [
      {
        title: "Overview",
        rows: [
          { label: "Current period revenue", value: cents(report.revenue_cents_this) },
          { label: "Previous period revenue", value: cents(report.revenue_cents_last) },
          { label: "Change", value: `${(report.pct_change ?? 0).toFixed(1)}%` },
          { label: "Avg revenue per day", value: cents(report.avg_revenue_per_day_cents) },
          { label: "Projected monthly", value: cents(report.projected_monthly_revenue_cents) },
        ],
      },
    ],
    tables: [
      {
        title: "Revenue by Tier",
        headers: ["Tier", "Revenue", "Count"],
        rows: report.by_tier.map((t) => [t.tier, cents(t.revenue_cents), String(t.leads_sold)]),
      },
      {
        title: "Revenue by Buyer",
        headers: ["Buyer", "Revenue", "Purchases"],
        rows: report.by_buyer.slice(0, 15).map((b) => [b.name, cents(b.total_spend_cents), String(b.purchases)]),
      },
    ],
  });

  return pdfResponse(html, `revenue-report-${now}.html`);
}
