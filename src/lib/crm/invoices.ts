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

const LOGO_URL = `${SITE_URL}/logo-horizontal.png`;

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
  leadPhone: string | null;
  tier: string;
  amount: string;
  amountCents: number;
  invoiceNumber: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
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

function formatCardBrand(brand: string): string {
  const map: Record<string, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    discover: "Discover",
    diners: "Diners Club",
    jcb: "JCB",
    unionpay: "UnionPay",
  };
  return map[brand.toLowerCase()] ?? brand.charAt(0).toUpperCase() + brand.slice(1);
}

const thStyle = `padding:12px 16px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${BRAND.accent};font-weight:700;`;

export function buildInvoiceHtml(data: InvoiceData): string {
  const generatedDate = new Date(data.generatedAt).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Collect unique payment methods for the summary
  const paymentMethods = data.purchases
    .filter((p) => p.cardBrand && p.cardLast4)
    .reduce<Map<string, { brand: string; last4: string }>>((acc, p) => {
      const key = `${p.cardBrand}-${p.cardLast4}`;
      if (!acc.has(key)) acc.set(key, { brand: p.cardBrand!, last4: p.cardLast4! });
      return acc;
    }, new Map());

  // Collect unique invoice numbers
  const invoiceNumbers = [...new Set(data.purchases.map((p) => p.invoiceNumber).filter(Boolean))] as string[];

  const purchaseRows = data.purchases
    .map(
      (p, i) => `<tr style="background-color:${i % 2 === 0 ? BRAND.white : BRAND.cream};">
        <td style="padding:12px 16px;font-size:13px;color:${BRAND.ink};border-bottom:1px solid ${BRAND.line};">${escapeHtml(p.date)}</td>
        <td style="padding:12px 16px;font-size:13px;color:${BRAND.ink};border-bottom:1px solid ${BRAND.line};">
          <span style="font-weight:600;">${escapeHtml(p.leadName)}</span>
          ${p.leadPhone ? `<br/><span style="font-size:12px;color:${BRAND.muted};">${escapeHtml(p.leadPhone)}</span>` : ""}
        </td>
        <td style="padding:12px 16px;font-size:13px;color:${BRAND.ink};border-bottom:1px solid ${BRAND.line};text-transform:uppercase;font-weight:600;letter-spacing:0.04em;">${escapeHtml(p.tier)}</td>
        <td style="padding:12px 16px;font-size:13px;color:${BRAND.ink};border-bottom:1px solid ${BRAND.line};text-align:right;font-weight:600;">${escapeHtml(p.amount)}</td>
      </tr>`,
    )
    .join("");

  const paymentMethodHtml =
    paymentMethods.size > 0
      ? [...paymentMethods.values()]
          .map(
            (pm) =>
              `<span style="display:inline-block;background:${BRAND.cream};border:1px solid ${BRAND.line};border-radius:6px;padding:6px 12px;font-size:13px;color:${BRAND.ink};font-weight:600;margin-right:8px;">
                ${escapeHtml(formatCardBrand(pm.brand))} &bull;&bull;&bull;&bull; ${escapeHtml(pm.last4)}
              </span>`,
          )
          .join("")
      : `<span style="font-size:13px;color:${BRAND.muted};">Not available</span>`;

  const invoiceNumberDisplay =
    invoiceNumbers.length > 0 ? invoiceNumbers.map((n) => `#${escapeHtml(n)}`).join(", ") : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Invoice${invoiceNumberDisplay ? ` ${invoiceNumberDisplay}` : ""} — ${SITE_NAME}</title>
  <style>
    @page { size: letter; margin: 0.75in 1in; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: ${BRAND.ink};
      margin: 0;
      padding: 40px;
      background: ${BRAND.white};
      -webkit-font-smoothing: antialiased;
    }
    @media print {
      body { padding: 0; background: ${BRAND.white}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    @media screen {
      body { max-width: 800px; margin: 0 auto; }
    }
  </style>
</head>
<body>
  <!-- Download button (screen only) -->
  <div class="no-print" style="text-align:right;margin-bottom:16px;">
    <button onclick="window.print()" style="background:${BRAND.deep};color:${BRAND.accent};border:none;border-radius:8px;padding:10px 24px;font-size:14px;font-weight:700;cursor:pointer;">Download PDF</button>
  </div>

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:3px solid ${BRAND.deep};padding-bottom:24px;margin-bottom:32px;">
    <tr>
      <td style="vertical-align:middle;">
        <img src="${LOGO_URL}" alt="${SITE_NAME}" width="160" style="display:block;max-width:160px;height:auto;" />
      </td>
      <td style="text-align:right;vertical-align:middle;">
        <p style="margin:0;font-size:32px;font-weight:800;color:${BRAND.deep};letter-spacing:-0.02em;">INVOICE</p>
        ${invoiceNumberDisplay ? `<p style="margin:6px 0 0;font-size:16px;font-weight:700;color:${BRAND.forest};">${invoiceNumberDisplay}</p>` : ""}
        <p style="margin:6px 0 0;font-size:12px;color:${BRAND.muted};">Generated ${escapeHtml(generatedDate)}</p>
      </td>
    </tr>
  </table>

  <!-- Bill To / From -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
    <tr>
      <td style="width:50%;vertical-align:top;padding-right:24px;">
        <p style="margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:${BRAND.muted};font-weight:700;">Bill To</p>
        <p style="margin:0;font-size:17px;font-weight:700;color:${BRAND.ink};">${escapeHtml(data.buyerName)}</p>
        ${data.businessName && data.businessName !== data.buyerName ? `<p style="margin:4px 0 0;font-size:14px;color:${BRAND.ink};">${escapeHtml(data.businessName)}</p>` : ""}
        <p style="margin:4px 0 0;font-size:13px;color:${BRAND.muted};">${escapeHtml(data.buyerEmail)}</p>
      </td>
      <td style="width:50%;vertical-align:top;text-align:right;">
        <p style="margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:${BRAND.muted};font-weight:700;">From</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:${BRAND.ink};">${SITE_NAME}</p>
        <p style="margin:4px 0 0;font-size:13px;color:${BRAND.muted};">${BUSINESS.address.street}</p>
        <p style="margin:2px 0 0;font-size:13px;color:${BRAND.muted};">${BUSINESS.email}</p>
        <p style="margin:2px 0 0;font-size:13px;color:${BRAND.muted};">${BUSINESS.phone}</p>
      </td>
    </tr>
  </table>

  <!-- Summary bar -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};border-radius:10px;border:1px solid ${BRAND.line};margin-bottom:28px;">
    <tr>
      <td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;">
              <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};font-weight:700;">Period</span><br/>
              <span style="font-size:15px;color:${BRAND.ink};font-weight:700;">${escapeHtml(data.startDate)} — ${escapeHtml(data.endDate)}</span>
            </td>
            <td style="text-align:center;vertical-align:middle;">
              <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};font-weight:700;">Leads</span><br/>
              <span style="font-size:15px;color:${BRAND.ink};font-weight:700;">${data.purchases.length}</span>
            </td>
            <td style="text-align:right;vertical-align:middle;">
              <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};font-weight:700;">Payment Method</span><br/>
              ${paymentMethodHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Purchase table -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.line};border-radius:10px;overflow:hidden;margin-bottom:24px;">
    <thead>
      <tr style="background-color:${BRAND.deep};">
        <th style="${thStyle}text-align:left;">Date</th>
        <th style="${thStyle}text-align:left;">Lead</th>
        <th style="${thStyle}text-align:left;">Tier</th>
        <th style="${thStyle}text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${purchaseRows}
    </tbody>
  </table>

  <!-- Total -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
    <tr>
      <td></td>
      <td style="width:260px;text-align:right;">
        <div style="background:${BRAND.deep};border-radius:10px;padding:16px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:14px;color:${BRAND.cream};font-weight:600;vertical-align:middle;">Total (CAD)</td>
              <td style="font-size:24px;color:${BRAND.accent};font-weight:800;text-align:right;vertical-align:middle;">${escapeHtml(data.totalDisplay)}</td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  </table>

  <!-- Footer -->
  <div style="border-top:2px solid ${BRAND.deep};padding-top:20px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:11px;color:${BRAND.muted};line-height:1.8;">
          <strong style="color:${BRAND.ink};">${SITE_NAME}</strong> &middot; ${BUSINESS.address.street} &middot;
          <a href="${SITE_URL}" style="color:${BRAND.forest};text-decoration:none;">${SITE_URL.replace("https://", "")}</a><br/>
          ${BUSINESS.email} &middot; ${BUSINESS.phone}
        </td>
        <td style="text-align:right;font-size:10px;color:${BRAND.muted};line-height:1.8;">
          All amounts in Canadian dollars (CAD).<br/>
          Lead purchases are final. This invoice is for your records only.
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}
