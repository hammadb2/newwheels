// Branded PDF invoice builder for buyer accounts.
// Uses inline HTML/CSS for print-ready rendering (same pattern as pdf-export.ts).

import { SITE_URL, SITE_NAME, BUSINESS } from "@/lib/site";

const BRAND = {
  deep: "#0A2818",
  forest: "#155235",
  accent: "#D9FF4E",
  cream: "#F5F1E8",
  ink: "#0A2818",
  muted: "#6B7280",
  white: "#FFFFFF",
  line: "#E5E1D8",
};

const LOGO_URL = `${SITE_URL}/logo-email.png`;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type InvoicePurchase = {
  date: string;
  leadName: string;
  tier: string;
  amount: string;
  amountCents: number;
};

export type InvoiceData = {
  buyerName: string;
  buyerEmail: string;
  businessName: string | null;
  startDate: string;
  endDate: string;
  purchases: InvoicePurchase[];
  totalDisplay: string;
  totalCents: number;
  generatedAt: string;
};

export function buildInvoiceHtml(data: InvoiceData): string {
  const generatedDate = new Date(data.generatedAt).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const purchaseRows = data.purchases
    .map(
      (p, i) => `<tr style="background-color:${i % 2 === 0 ? BRAND.white : BRAND.cream};">
        <td style="padding:10px 12px;font-size:13px;color:${BRAND.ink};border-bottom:1px solid ${BRAND.line};">${escapeHtml(p.date)}</td>
        <td style="padding:10px 12px;font-size:13px;color:${BRAND.ink};border-bottom:1px solid ${BRAND.line};">${escapeHtml(p.leadName)}</td>
        <td style="padding:10px 12px;font-size:13px;color:${BRAND.ink};border-bottom:1px solid ${BRAND.line};text-transform:uppercase;font-weight:600;letter-spacing:0.04em;">${escapeHtml(p.tier)}</td>
        <td style="padding:10px 12px;font-size:13px;color:${BRAND.ink};border-bottom:1px solid ${BRAND.line};text-align:right;font-weight:600;">${escapeHtml(p.amount)}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: letter; margin: 0.75in 1in; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: ${BRAND.ink}; margin: 0; padding: 0; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <!-- Header with logo -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:3px solid ${BRAND.deep};padding-bottom:20px;margin-bottom:28px;">
    <tr>
      <td style="vertical-align:middle;">
        <img src="${LOGO_URL}" alt="${SITE_NAME}" width="160" style="display:block;max-width:160px;height:auto;" />
      </td>
      <td style="text-align:right;vertical-align:middle;">
        <p style="margin:0;font-size:28px;font-weight:800;color:${BRAND.deep};letter-spacing:-0.02em;">INVOICE</p>
        <p style="margin:4px 0 0;font-size:12px;color:${BRAND.muted};">Generated ${escapeHtml(generatedDate)}</p>
      </td>
    </tr>
  </table>

  <!-- Bill To + Period -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr>
      <td style="width:50%;vertical-align:top;">
        <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};font-weight:700;">Bill To</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:${BRAND.ink};">${escapeHtml(data.buyerName)}</p>
        ${data.businessName && data.businessName !== data.buyerName ? `<p style="margin:2px 0 0;font-size:13px;color:${BRAND.ink};">${escapeHtml(data.businessName)}</p>` : ""}
        <p style="margin:2px 0 0;font-size:13px;color:${BRAND.muted};">${escapeHtml(data.buyerEmail)}</p>
      </td>
      <td style="width:50%;vertical-align:top;text-align:right;">
        <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};font-weight:700;">From</p>
        <p style="margin:0;font-size:14px;font-weight:700;color:${BRAND.ink};">${SITE_NAME}</p>
        <p style="margin:2px 0 0;font-size:13px;color:${BRAND.muted};">${BUSINESS.address.street}</p>
        <p style="margin:2px 0 0;font-size:13px;color:${BRAND.muted};">${BUSINESS.email}</p>
        <p style="margin:2px 0 0;font-size:13px;color:${BRAND.muted};">${BUSINESS.phone}</p>
      </td>
    </tr>
  </table>

  <!-- Period -->
  <div style="background-color:${BRAND.cream};border-radius:8px;padding:12px 16px;margin-bottom:24px;border:1px solid ${BRAND.line};">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${BRAND.muted};font-weight:600;">Period</span>
          <span style="font-size:14px;color:${BRAND.ink};font-weight:700;margin-left:8px;">${escapeHtml(data.startDate)} to ${escapeHtml(data.endDate)}</span>
        </td>
        <td style="text-align:right;">
          <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${BRAND.muted};font-weight:600;">Leads purchased</span>
          <span style="font-size:14px;color:${BRAND.ink};font-weight:700;margin-left:8px;">${data.purchases.length}</span>
        </td>
      </tr>
    </table>
  </div>

  <!-- Purchase table -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.line};border-radius:8px;overflow:hidden;margin-bottom:20px;">
    <thead>
      <tr style="background-color:${BRAND.deep};">
        <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${BRAND.accent};text-align:left;font-weight:700;">Date</th>
        <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${BRAND.accent};text-align:left;font-weight:700;">Lead</th>
        <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${BRAND.accent};text-align:left;font-weight:700;">Tier</th>
        <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${BRAND.accent};text-align:right;font-weight:700;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${purchaseRows}
    </tbody>
  </table>

  <!-- Total -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
    <tr>
      <td></td>
      <td style="width:240px;text-align:right;">
        <div style="background-color:${BRAND.deep};border-radius:8px;padding:14px 20px;display:inline-block;width:100%;box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:${BRAND.cream};font-weight:600;">Total (CAD)</td>
              <td style="font-size:22px;color:${BRAND.accent};font-weight:800;text-align:right;">${escapeHtml(data.totalDisplay)}</td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  </table>

  <!-- Footer -->
  <div style="border-top:2px solid ${BRAND.deep};padding-top:16px;margin-top:40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:10px;color:${BRAND.muted};line-height:1.6;">
          <strong style="color:${BRAND.ink};">${SITE_NAME}</strong> &middot; ${BUSINESS.address.street} &middot;
          <a href="${SITE_URL}" style="color:${BRAND.forest};text-decoration:none;">${SITE_URL.replace("https://", "")}</a><br/>
          ${BUSINESS.email} &middot; ${BUSINESS.phone}
        </td>
        <td style="text-align:right;font-size:9px;color:${BRAND.muted};">
          All amounts in Canadian dollars (CAD).<br/>
          Lead purchases are final. This invoice is for your records only.
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}
