// GET /api/crm/reports/acquisition-pdf — acquisition data room PDF export.
//
// One-click export from CEO admin panel. Branded PDF with live data.

import { NextResponse } from "next/server";
import { readSession } from "@/lib/crm/auth/session";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { buildPdfHtml, pdfResponse } from "@/lib/crm/pdf-export";
import { defaultThisMonth, loadRevenueReport, loadLeadPerformanceReport, loadLeadCostReport, loadBuyerReport, loadTeamPerformanceReport } from "@/lib/crm/reports/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cents(v: number): string {
  return `$${(v / 100).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`;
}

function pct(v: number): string {
  return `${v.toFixed(1)}%`;
}

export async function GET() {
  const session = await readSession("crm");
  if (!session || session.subject.kind !== "team" || session.subject.role !== "ceo") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const range = defaultThisMonth();
  const [revenue, leads, costs, buyers, team] = await Promise.all([
    loadRevenueReport(range),
    loadLeadPerformanceReport(range),
    loadLeadCostReport(range),
    loadBuyerReport(range),
    loadTeamPerformanceReport(range),
  ]);

  const now = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });

  const html = buildPdfHtml({
    title: "NewWheels Acquisition Data Room",
    subtitle: "Confidential — Prepared for potential acquirers",
    date: now,
    sections: [
      {
        title: "Revenue Summary",
        rows: [
          { label: "Current period revenue", value: cents(revenue.revenue_cents_this) },
          { label: "Previous period revenue", value: cents(revenue.revenue_cents_last) },
          { label: "Period-over-period change", value: pct(revenue.pct_change ?? 0) },
          { label: "Avg revenue per day", value: cents(revenue.avg_revenue_per_day_cents) },
          { label: "Projected monthly revenue", value: cents(revenue.projected_monthly_revenue_cents) },
        ],
      },
      {
        title: "Unit Economics",
        rows: [
          { label: "Total revenue", value: cents(costs.revenue_cents) },
          { label: "Acquisition cost per lead", value: cents(costs.acquisition_cost_per_lead_cents) },
          { label: "Qualification cost per qualified", value: cents(costs.qualification_cost_per_qualified_cents) },
          { label: "Cost per sellable lead", value: cents(costs.cost_per_sellable_lead_cents) },
          { label: "Breakeven price", value: cents(costs.breakeven_price_cents) },
          { label: "Avg sale price", value: cents(costs.avg_sale_price_cents) },
          { label: "Gross margin", value: `${cents(costs.gross_margin_cents)} (${pct(costs.gross_margin_pct ?? 0)})` },
        ],
      },
      {
        title: "Lead Performance",
        rows: [
          { label: "Leads received", value: String(leads.received) },
          { label: "Leads qualified", value: String(leads.qualified) },
          { label: "Leads sold", value: String(leads.sold) },
          { label: "Leads expired", value: String(leads.expired) },
          { label: "Qualification rate", value: pct(leads.qualification_rate) },
          { label: "Sale rate", value: pct(leads.sale_rate) },
          { label: "Expiry rate", value: pct(leads.expiry_rate) },
          { label: "Average score", value: String(leads.avg_score) },
        ],
      },
    ],
    tables: [
      {
        title: "Buyer Concentration Analysis",
        headers: ["Buyer", "Kind", "Purchases", "Lifetime Spend", "Status"],
        rows: buyers.buyers.slice(0, 20).map((b) => [
          b.name,
          b.kind,
          String(b.purchases),
          cents(b.lifetime_spend_cents),
          b.status,
        ]),
      },
      {
        title: "Team Cost Breakdown",
        headers: ["Name", "Role", "Qualified", "Avg Score", "Avg Qual Minutes"],
        rows: team.members.map((m) => [
          m.name,
          m.role,
          String(m.qualified),
          String(m.avg_score),
          String(m.avg_qual_minutes),
        ]),
      },
    ],
    footer: "This document contains confidential business information. Distribution without written consent is prohibited.",
  });

  return pdfResponse(html, `newwheels-data-room-${new Date().toISOString().slice(0, 10)}.html`);
}
