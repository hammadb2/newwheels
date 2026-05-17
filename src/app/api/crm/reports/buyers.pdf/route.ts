// GET /api/crm/reports/buyers.pdf — branded PDF export of buyer report.

import { NextResponse } from "next/server";
import { readSession } from "@/lib/crm/auth/session";
import { buildPdfHtml, pdfResponse } from "@/lib/crm/pdf-export";
import { defaultThisMonth, loadBuyerReport } from "@/lib/crm/reports/queries";

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

  const report = await loadBuyerReport(defaultThisMonth());
  const now = new Date().toLocaleDateString("en-CA");

  const html = buildPdfHtml({
    title: "Buyer & Dealer Report",
    date: now,
    tables: [
      {
        title: "All Buyers",
        headers: ["Name", "Kind", "Purchases", "Spend", "Avg Price", "Lifetime", "Status", "Churn Risk"],
        rows: report.buyers.map((b) => [
          b.name,
          b.kind,
          String(b.purchases),
          cents(b.spend_cents),
          cents(b.avg_price_cents),
          cents(b.lifetime_spend_cents),
          b.status,
          b.churn_flag ? "FLAGGED" : "",
        ]),
      },
    ],
  });

  return pdfResponse(html, `buyer-report-${now}.html`);
}
