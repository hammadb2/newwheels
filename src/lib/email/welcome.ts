// Welcome email — fires on first login for both team members and buyers.

import { sendEmail } from "./resend";
import { EMAIL_BRAND as B, ctaButton, systemEmailWrapper } from "./wrapper";

export async function sendWelcomeEmailTeam(opts: {
  to: string;
  firstName: string;
  role: string;
  crmUrl: string;
}): Promise<void> {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      Welcome to NewWheels, ${opts.firstName}!
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
      You&rsquo;re all set as <strong>${opts.role}</strong> on the NewWheels team.
      Log in to the CRM to get started.
    </p>
    ${ctaButton(opts.crmUrl, "Open the CRM")}
    <p style="margin:0;font-size:13px;color:${B.muted};">
      Questions? Reply to this email or reach out to your team lead.
    </p>
  `;

  void sendEmail({
    to: opts.to,
    subject: "Welcome to NewWheels",
    html: systemEmailWrapper(body),
    tags: [{ name: "type", value: "welcome_team" }],
  });
}

export async function sendWelcomeEmailBuyer(opts: {
  to: string;
  contactName: string;
  portalUrl: string;
}): Promise<void> {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      Welcome to NewWheels, ${opts.contactName}!
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
      Your account is set up and ready to go. Browse pre-qualified leads
      in the marketplace and start closing deals.
    </p>
    ${ctaButton(opts.portalUrl, "Browse marketplace")}
    <p style="margin:0;font-size:13px;color:${B.muted};">
      Need help? Reply to this email or call us at (587) 900-6051.
    </p>
  `;

  void sendEmail({
    to: opts.to,
    subject: "Welcome to NewWheels",
    html: systemEmailWrapper(body),
    tags: [{ name: "type", value: "welcome_buyer" }],
  });
}
