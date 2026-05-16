// Shared HTML wrapper for all system emails so they all carry the same
// header/footer + brand. This is a stripped-down version of the wrapper in
// src/lib/email-templates.ts, but reused so changes to colors propagate.

import { BUSINESS, SITE_NAME, SITE_URL } from "@/lib/site";

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

export const EMAIL_BRAND = BRAND;
export const EMAIL_LOGO = `${SITE_URL}/logo-email.png`;

export function systemEmailWrapper(body: string): string {
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
          <tr>
            <td style="background-color:${BRAND.deep};padding:24px 32px;border-radius:16px 16px 0 0;text-align:center;">
              <img src="${EMAIL_LOGO}" alt="${SITE_NAME}" width="180" style="display:block;margin:0 auto;max-width:180px;height:auto;" />
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.white};padding:32px;border-left:1px solid ${BRAND.line};border-right:1px solid ${BRAND.line};">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.cream};padding:20px 32px;border-radius:0 0 16px 16px;border:1px solid ${BRAND.line};border-top:none;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px;color:${BRAND.muted};line-height:1.6;">
                    <strong style="color:${BRAND.ink};">${SITE_NAME}</strong> · Calgary, AB ·
                    <a href="${SITE_URL}" style="color:${BRAND.forest};text-decoration:none;">${SITE_URL.replace("https://", "")}</a>
                    <br/>
                    <a href="mailto:${BUSINESS.email}" style="color:${BRAND.forest};text-decoration:none;">${BUSINESS.email}</a>
                    &nbsp;·&nbsp;
                    <a href="tel:${BUSINESS.phoneHref}" style="color:${BRAND.forest};text-decoration:none;">${BUSINESS.phone}</a>
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

export function ctaButton(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background-color:${BRAND.deep};border-radius:8px;">
        <a href="${url}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:700;color:${BRAND.accent};text-decoration:none;letter-spacing:0.02em;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}
