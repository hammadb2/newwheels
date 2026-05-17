// GET /api/crm/reports/lead-cost.pdf — branded PDF export of lead cost report.

import { NextResponse } from "next/server";
import { readSession } from "@/lib/crm/auth/session";
import { buildPdfHtml, pdfResponse } from "@/lib/crm/pdf-export";
import { defaultThisMonth, loadLeadCostReport } from "@/lib/crm/reports/queries";

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

  const report = await loadLeadCostReport(defaultThisMonth());
  const now = new Date().toLocaleDateString("en-CA");

  const html = buildPdfHtml({
    title: "Lead Cost Breakdown Report",
    date: now,
    sections: [
      {
        title: "Cost Analysis",
        rows: [
          { label: "Total revenue", value: cents(report.revenue_cents) },
          { label: "Acquisition cost", value: cents(report.cost_acquisition_cents) },
          { label: "Qualification cost", value: cents(report.cost_qualification_cents) },
          { label: "Platform cost", value: cents(report.cost_platform_cents) },
          { label: "Total cost", value: cents(report.cost_total_cents) },
        ],
      },
      {
        title: "Volume Metrics",
        rows: [
          { label: "Leads received", value: String(report.leads_received) },
          { label: "Leads qualified", value: String(report.leads_qualified) },
          { label: "Leads sold", value: String(report.leads_sold) },
        ],
      },
      {
        title: "Unit Economics",
        rows: [
          { label: "Acquisition cost per lead", value: cents(report.acquisition_cost_per_lead_cents) },
          { label: "Qualification cost per qualified", value: cents(report.qualification_cost_per_qualified_cents) },
          { label: "Cost per sellable lead", value: cents(report.cost_per_sellable_lead_cents) },
          { label: "Breakeven price", value: cents(report.breakeven_price_cents) },
          { label: "Avg sale price", value: cents(report.avg_sale_price_cents) },
          { label: "Gross margin", value: `${cents(report.gross_margin_cents)} (${(report.gross_margin_pct ?? 0).toFixed(1)}%)` },
          { label: "Expiry cost", value: cents(report.expiry_cost_cents) },
        ],
      },
    ],
  });

  return pdfResponse(html, `lead-cost-${now}.html`);
}
