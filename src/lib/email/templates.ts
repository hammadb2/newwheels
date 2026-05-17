// All system email templates for the CRM + buyer portal.
//
// One file, one wrapper, one consistent visual feel. Each function returns
// the HTML string only; the calling code chooses subject lines + recipients.
//
// IMPORTANT: every template tolerates missing optional data — we never want
// a noisy "undefined" to leak into a customer-facing email.

import { BUSINESS, SITE_NAME, SITE_URL } from "@/lib/site";
import { EMAIL_BRAND as B, ctaButton, systemEmailWrapper } from "./wrapper";

// -----------------------------------------------------------------
// OTP login code
// -----------------------------------------------------------------
export function otpEmail(opts: { code: string; audience: "crm" | "portal" }): string {
  const audienceLabel = opts.audience === "crm" ? "NewWheels CRM" : "NewWheels Portal";
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      Your login code
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${B.muted};line-height:1.6;">
      Enter this 6-digit code on the ${audienceLabel} login screen.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <div style="display:inline-block;padding:18px 32px;border-radius:12px;background-color:${B.deep};color:${B.accent};font-size:36px;font-weight:800;letter-spacing:0.4em;font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
        ${escapeHtml(opts.code)}
      </div>
    </div>
    <p style="margin:0 0 12px;font-size:13px;color:${B.muted};line-height:1.6;">
      This code expires in 10 minutes and can be used once. If you didn't try to sign in to NewWheels just now, you can ignore this email.
    </p>
  `;
  return systemEmailWrapper(body);
}

// -----------------------------------------------------------------
// Welcome on first login
// -----------------------------------------------------------------
export function welcomeEmail(opts: { displayName: string; audience: "crm" | "portal"; ctaUrl: string }): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      Welcome to ${SITE_NAME}, ${escapeHtml(opts.displayName)}.
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${B.muted};line-height:1.6;">
      Your ${opts.audience === "crm" ? "team account" : "buyer account"} is set up. Sign in any time with your email — we send a fresh 6-digit code each time.
    </p>
    ${ctaButton(opts.ctaUrl, opts.audience === "crm" ? "Open the CRM" : "Open the buyer portal")}
    <p style="margin:0;font-size:13px;color:${B.muted};line-height:1.6;">
      Questions? Reply to this email and we'll take a look.
    </p>
  `;
  return systemEmailWrapper(body);
}

// -----------------------------------------------------------------
// Applicant: "we received your application"
// -----------------------------------------------------------------
export function leadReceivedEmail(opts: {
  firstName: string;
  applyUrl?: string;
}): string {
  const cta = opts.applyUrl
    ? `${ctaButton(opts.applyUrl, "Track your application")}
       <p style="margin:0 0 16px;font-size:13px;color:${B.muted};line-height:1.6;">
         You can also upload your driver's licence, work permit, and proof of income from your phone using the link above — verified applications get priority.
       </p>`
    : "";
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      We got your application, ${escapeHtml(opts.firstName)}.
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
      A specialist will call you within 1 hour during business hours (${BUSINESS.hours}). If you don't hear from us, call <a href="tel:${BUSINESS.phoneHref}" style="color:${B.forest};font-weight:600;">${BUSINESS.phone}</a>.
    </p>
    ${cta}
    <p style="margin:0;font-size:13px;color:${B.muted};line-height:1.6;">
      Talk soon,<br/>The ${SITE_NAME} Team
    </p>
  `;
  return systemEmailWrapper(body);
}

// -----------------------------------------------------------------
// Lead Qualifier: "new lead assigned"
// -----------------------------------------------------------------
export function leadAssignedEmail(opts: {
  qualifierName: string;
  fullName: string;
  phone: string;
  email: string;
  sourcePage: string;
  leadUrl: string;
}): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      New lead assigned to you
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
      Hi ${escapeHtml(opts.qualifierName)} — please reach out to <strong>${escapeHtml(opts.fullName)}</strong> as soon as possible.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${B.creamSoft};border-radius:12px;border:1px solid ${B.line};margin-bottom:16px;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Phone</p>
        <p style="margin:0 0 12px;font-size:15px;color:${B.ink};font-weight:600;">${escapeHtml(opts.phone)}</p>
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Email</p>
        <p style="margin:0 0 12px;font-size:15px;color:${B.ink};">${escapeHtml(opts.email)}</p>
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Source page</p>
        <p style="margin:0;font-size:14px;color:${B.ink};">${escapeHtml(opts.sourcePage)}</p>
      </td></tr>
    </table>
    ${ctaButton(opts.leadUrl, "Open lead in CRM")}
  `;
  return systemEmailWrapper(body);
}

// -----------------------------------------------------------------
// CEO + Platform Ops: "lead qualification complete"
// -----------------------------------------------------------------
export function qualificationCompleteEmail(opts: {
  leadFirstName: string;
  qualifierName: string;
  tier: string;
  score: number;
  startingPrice: string;
  leadUrl: string;
}): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      Qualification complete: ${escapeHtml(opts.leadFirstName)}
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
      Qualified by ${escapeHtml(opts.qualifierName)}. Now live in the marketplace.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${B.creamSoft};border-radius:12px;border:1px solid ${B.line};margin-bottom:16px;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Tier</p>
        <p style="margin:0 0 12px;font-size:15px;color:${B.ink};font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(opts.tier)}</p>
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Score</p>
        <p style="margin:0 0 12px;font-size:15px;color:${B.ink};">${opts.score} / 100</p>
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Starting price</p>
        <p style="margin:0;font-size:15px;color:${B.ink};font-weight:700;">${escapeHtml(opts.startingPrice)}</p>
      </td></tr>
    </table>
    ${ctaButton(opts.leadUrl, "View lead")}
  `;
  return systemEmailWrapper(body);
}

// -----------------------------------------------------------------
// Buyer: "new lead matching your saved filter"
// -----------------------------------------------------------------
export function newLeadAvailableEmail(opts: {
  buyerName: string;
  filterName: string;
  summary: string;
  tier: string;
  price: string;
  marketplaceUrl: string;
}): string {
  const tierUpper = opts.tier.toUpperCase();
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      A new ${escapeHtml(tierUpper)} lead matches your filter
    </h1>
    <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Filter</p>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};font-weight:600;">${escapeHtml(opts.filterName)}</p>
    <p style="margin:0 0 8px;font-size:14px;color:${B.ink};line-height:1.6;">
      ${escapeHtml(opts.summary)}
    </p>
    <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Current price</p>
    <p style="margin:0 0 16px;font-size:22px;color:${B.ink};font-weight:800;">${escapeHtml(opts.price)}</p>
    ${ctaButton(opts.marketplaceUrl, "Open marketplace")}
    <p style="margin:0;font-size:12px;color:${B.muted};line-height:1.5;">
      Hi ${escapeHtml(opts.buyerName)} — these go fast. Lead purchases are final.
    </p>
  `;
  return systemEmailWrapper(body);
}

// -----------------------------------------------------------------
// Buyer: "purchase confirmation" with full lead details
// -----------------------------------------------------------------
export function purchaseConfirmationEmail(opts: {
  buyerName: string;
  amount: string;
  lead: {
    fullName: string;
    phone: string;
    email: string;
    summary: string;
    notes?: string | null;
    qualifierName?: string | null;
  };
  dashboardUrl: string;
}): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      Lead unlocked
    </h1>
    <p style="margin:0 0 20px;font-size:15px;color:${B.ink};line-height:1.6;">
      Hi ${escapeHtml(opts.buyerName)} — we charged your card <strong>${escapeHtml(opts.amount)}</strong>. Here are the full contact details.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${B.creamSoft};border-radius:12px;border:1px solid ${B.line};margin-bottom:20px;">
      <tr><td style="padding:18px;">
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Name</p>
        <p style="margin:0 0 12px;font-size:17px;color:${B.ink};font-weight:700;">${escapeHtml(opts.lead.fullName)}</p>
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Phone</p>
        <p style="margin:0 0 12px;font-size:15px;color:${B.ink};font-weight:600;">
          <a href="tel:${escapeHtml(opts.lead.phone.replace(/[^+\d]/g, ""))}" style="color:${B.forest};text-decoration:none;">${escapeHtml(opts.lead.phone)}</a>
        </p>
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Email</p>
        <p style="margin:0 0 12px;font-size:15px;color:${B.ink};">
          <a href="mailto:${escapeHtml(opts.lead.email)}" style="color:${B.forest};text-decoration:none;">${escapeHtml(opts.lead.email)}</a>
        </p>
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Profile</p>
        <p style="margin:0;font-size:14px;color:${B.ink};line-height:1.5;">${escapeHtml(opts.lead.summary)}</p>
        ${opts.lead.notes ? `<p style=\"margin:12px 0 4px;font-size:13px;color:${B.muted};\">Notes</p><p style=\"margin:0;font-size:14px;color:${B.ink};line-height:1.5;\">${escapeHtml(opts.lead.notes)}</p>` : ""}
      </td></tr>
    </table>
    ${ctaButton(opts.dashboardUrl, "Open lead in portal")}
    <p style="margin:0;font-size:12px;color:${B.muted};line-height:1.5;">
      Lead purchases are final. If the number is bad you have 24 hours to file a dispute from your dashboard.
    </p>
  `;
  return systemEmailWrapper(body);
}

// -----------------------------------------------------------------
// Buyer: verification approved / rejected
// -----------------------------------------------------------------
export function verificationApprovedEmail(opts: { contactName: string; portalUrl: string }): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      You're approved.
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
      Hi ${escapeHtml(opts.contactName)} — your ${SITE_NAME} buyer account is active. Add a payment method to start buying leads.
    </p>
    ${ctaButton(opts.portalUrl, "Open buyer portal")}
  `;
  return systemEmailWrapper(body);
}

export function verificationRejectedEmail(opts: { contactName: string; reasonLabel: string }): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      We couldn't verify your account
    </h1>
    <p style="margin:0 0 12px;font-size:15px;color:${B.ink};line-height:1.6;">
      Hi ${escapeHtml(opts.contactName)} — we reviewed your submission and can't approve it as-is.
    </p>
    <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Reason</p>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};font-weight:600;">${escapeHtml(opts.reasonLabel)}</p>
    <p style="margin:0;font-size:14px;color:${B.muted};line-height:1.6;">
      Reply to this email if you'd like to provide updated documents.
    </p>
  `;
  return systemEmailWrapper(body);
}

// -----------------------------------------------------------------
// Dealer master: low budget alert
// -----------------------------------------------------------------
export function lowBudgetAlertEmail(opts: {
  masterName: string;
  subName: string;
  remaining: string;
  allocated: string;
  portalUrl: string;
}): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      ${escapeHtml(opts.subName)} is at 20% remaining
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
      Hi ${escapeHtml(opts.masterName)} — your sub-account <strong>${escapeHtml(opts.subName)}</strong> has <strong>${escapeHtml(opts.remaining)}</strong> left of its <strong>${escapeHtml(opts.allocated)}</strong> monthly allocation.
    </p>
    ${ctaButton(opts.portalUrl, "Manage budgets")}
  `;
  return systemEmailWrapper(body);
}

// -----------------------------------------------------------------
// Lead Qualifier + Ops: lead expired
// -----------------------------------------------------------------
export function leadExpiredEmail(opts: {
  recipientName: string;
  leadFirstName: string;
  tier: string;
  finalPrice: string;
  leadUrl: string;
}): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      Lead expired unsold: ${escapeHtml(opts.leadFirstName)}
    </h1>
    <p style="margin:0 0 16px;font-size:14px;color:${B.ink};line-height:1.6;">
      Hi ${escapeHtml(opts.recipientName)} — a ${escapeHtml(opts.tier)} lead aged out at <strong>${escapeHtml(opts.finalPrice)}</strong>. CEO can re-list at the $75 floor.
    </p>
    ${ctaButton(opts.leadUrl, "Review lead")}
  `;
  return systemEmailWrapper(body);
}

// -----------------------------------------------------------------
// Buyer re-engagement
// -----------------------------------------------------------------
export function reEngagementEmail(opts: { contactName: string; marketplaceUrl: string }): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      Calgary leads are waiting
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
      Hi ${escapeHtml(opts.contactName)} — it's been a couple of weeks. We've had a steady flow of qualified buyers in your area. Take a look.
    </p>
    ${ctaButton(opts.marketplaceUrl, "Open the marketplace")}
  `;
  return systemEmailWrapper(body);
}

// -----------------------------------------------------------------
// Team: new buyer application submitted
// -----------------------------------------------------------------
export function buyerApplicationEmail(opts: {
  name: string;
  email: string;
  kind: "dealer_master" | "individual";
  phone: string;
  amvicLicence: string;
  reviewUrl: string;
}): string {
  const kindLabel = opts.kind === "dealer_master" ? "Dealer master account" : "Individual buyer";
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      New buyer application
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
      <strong>${escapeHtml(opts.name)}</strong> just submitted a ${kindLabel.toLowerCase()} application and is waiting for verification.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${B.creamSoft};border-radius:12px;border:1px solid ${B.line};margin-bottom:16px;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Type</p>
        <p style="margin:0 0 12px;font-size:15px;color:${B.ink};font-weight:600;">${escapeHtml(kindLabel)}</p>
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Email</p>
        <p style="margin:0 0 12px;font-size:15px;color:${B.ink};">${escapeHtml(opts.email)}</p>
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">Phone</p>
        <p style="margin:0 0 12px;font-size:15px;color:${B.ink};">${escapeHtml(opts.phone)}</p>
        <p style="margin:0 0 4px;font-size:13px;color:${B.muted};">AMVIC licence</p>
        <p style="margin:0;font-size:15px;color:${B.ink};font-weight:600;">${escapeHtml(opts.amvicLicence)}</p>
      </td></tr>
    </table>
    ${ctaButton(opts.reviewUrl, "Review in CRM")}
  `;
  return systemEmailWrapper(body);
}

// -----------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
