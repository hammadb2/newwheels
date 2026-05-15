import { BUSINESS, SITE_NAME, SITE_URL } from "./site";

// ── Brand tokens (must match tailwind.config.ts) ──────────────────────
const BRAND = {
  deep: "#0A2818",
  forest: "#155235",
  accent: "#D9FF4E",
  cream: "#F5F1E8",
  creamSoft: "#FAF7F0",
  ink: "#0A2818",
  muted: "#6B7280",
  line: "#E5E1D8",
  white: "#FFFFFF",
} as const;

const LOGO_URL = `${SITE_URL}/logo-email.png`;

// ── Shared layout wrapper ─────────────────────────────────────────────
function emailWrapper(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.creamSoft};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${BRAND.ink};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.creamSoft};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.deep};padding:24px 32px;border-radius:16px 16px 0 0;text-align:center;">
              <img src="${LOGO_URL}" alt="${SITE_NAME}" width="180" style="display:block;margin:0 auto;max-width:180px;height:auto;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:${BRAND.white};padding:32px;border-left:1px solid ${BRAND.line};border-right:1px solid ${BRAND.line};">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.cream};padding:24px 32px;border-radius:0 0 16px 16px;border:1px solid ${BRAND.line};border-top:none;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:${BRAND.muted};line-height:1.6;">
                    <strong style="color:${BRAND.ink};">${SITE_NAME} · Calgary</strong><br/>
                    <a href="tel:${BUSINESS.phoneHref}" style="color:${BRAND.forest};text-decoration:none;font-weight:600;">${BUSINESS.phone}</a>
                    &nbsp;·&nbsp;
                    <a href="mailto:${BUSINESS.email}" style="color:${BRAND.forest};text-decoration:none;">${BUSINESS.email}</a><br/>
                    ${BUSINESS.hours}<br/>
                    <a href="${BUSINESS.amvicRegistryUrl}" style="color:${BRAND.muted};text-decoration:underline;font-size:12px;" target="_blank" rel="noopener noreferrer">AMVIC licensed</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:16px;font-size:11px;color:${BRAND.muted};">
                    <a href="${SITE_URL}" style="color:${BRAND.forest};text-decoration:none;">${SITE_URL.replace("https://", "")}</a>
                    &nbsp;·&nbsp;
                    <a href="${SITE_URL}/privacy" style="color:${BRAND.muted};text-decoration:underline;">Privacy policy</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Auto-reply to applicant ───────────────────────────────────────────
export function autoReplyEmail(firstName: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND.ink};text-transform:uppercase;letter-spacing:-0.02em;">
      We received your application.
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
      Hi ${firstName}, thanks for choosing ${SITE_NAME}.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.creamSoft};border-radius:12px;border:1px solid ${BRAND.line};margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${BRAND.forest};text-transform:uppercase;letter-spacing:0.08em;">
            What happens next
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
            <tr>
              <td width="32" valign="top" style="font-size:14px;font-weight:800;color:${BRAND.forest};padding-bottom:8px;">01</td>
              <td style="font-size:14px;color:${BRAND.ink};padding-bottom:8px;line-height:1.5;">
                <strong>A specialist calls you</strong> within 1 hour during business hours (${BUSINESS.hours}).
              </td>
            </tr>
            <tr>
              <td width="32" valign="top" style="font-size:14px;font-weight:800;color:${BRAND.forest};padding-bottom:8px;">02</td>
              <td style="font-size:14px;color:${BRAND.ink};padding-bottom:8px;line-height:1.5;">
                <strong>We submit your file</strong> to the right lender. No hard credit check at this stage.
              </td>
            </tr>
            <tr>
              <td width="32" valign="top" style="font-size:14px;font-weight:800;color:${BRAND.forest};">03</td>
              <td style="font-size:14px;color:${BRAND.ink};line-height:1.5;">
                <strong>You get approval terms</strong> within 24 hours. No obligation.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:14px;color:${BRAND.ink};line-height:1.6;">
      If your situation is urgent, call us directly:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background-color:${BRAND.deep};border-radius:8px;">
          <a href="tel:${BUSINESS.phoneHref}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:700;color:${BRAND.accent};text-decoration:none;letter-spacing:0.02em;">
            Call ${BUSINESS.phone}
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:${BRAND.muted};line-height:1.6;">
      Talk soon,<br/>
      <strong style="color:${BRAND.ink};">The ${SITE_NAME} Team</strong>
    </p>
  `;
  return emailWrapper(body);
}

// ── Internal notification for the team ────────────────────────────────
export function notifyEmail(lead: {
  fullName: string;
  phone: string;
  email: string;
  credit: string;
  employment: string;
  visa: string;
  timeframe: string;
  sourcePage: string;
  notes: string;
  timestamp: string;
}): string {
  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:6px 12px;font-size:13px;font-weight:600;color:${BRAND.muted};white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:6px 12px;font-size:14px;color:${BRAND.ink};vertical-align:top;">${value}</td>
    </tr>`;

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td>
          <span style="display:inline-block;padding:4px 12px;border-radius:99px;background-color:${BRAND.accent};font-size:12px;font-weight:700;color:${BRAND.deep};text-transform:uppercase;letter-spacing:0.08em;">
            New lead
          </span>
        </td>
      </tr>
    </table>

    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:${BRAND.ink};">
      ${lead.fullName}
    </h1>
    <p style="margin:0 0 20px;font-size:15px;">
      <a href="tel:${lead.phone.replace(/[^+\d]/g, "")}" style="color:${BRAND.forest};font-weight:600;text-decoration:none;">${lead.phone}</a>
      &nbsp;·&nbsp;
      <a href="mailto:${lead.email}" style="color:${BRAND.forest};text-decoration:none;">${lead.email}</a>
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.creamSoft};border-radius:12px;border:1px solid ${BRAND.line};margin-bottom:24px;">
      <tr><td style="padding:4px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row("Credit", lead.credit)}
          ${row("Employment", lead.employment)}
          ${row("Status in Canada", lead.visa || "N/A")}
          ${row("Timeframe", lead.timeframe)}
          ${row("Source page", lead.sourcePage)}
          ${lead.notes ? row("Notes", lead.notes.replace(/\n/g, "<br/>")) : ""}
        </table>
      </td></tr>
    </table>

    <p style="margin:0;font-size:12px;color:${BRAND.muted};">
      Submitted ${lead.timestamp}
    </p>
  `;
  return emailWrapper(body);
}
