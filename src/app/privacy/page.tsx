import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

const SLUG = "/privacy";
const LEGAL_EMAIL = "legal@newwheels.ca";
const LEGAL_PHONE = "(587) 900-6051";
const LAST_UPDATED = "May 2026";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy | NewWheels Calgary",
  description:
    "How NewWheels collects, uses, discloses, and retains personal information. Governed by Alberta law and Canada's Personal Information Protection and Electronic Documents Act (PIPEDA).",
  path: SLUG,
  multilingual: false,
});

const FAQ = [
  {
    question: "How do I withdraw consent?",
    answer: `Email ${LEGAL_EMAIL} at any time. Withdrawal of consent may limit our ability to process your application or provide our services to you.`,
  },
  {
    question: "Does NewWheels pull credit reports?",
    answer:
      "No. NewWheels does not pull credit reports directly. Dealer and lender partners to whom we refer your application may obtain credit reports as part of their own approval process.",
  },
  {
    question: "How do I make an access, correction, or deletion request?",
    answer: `Email ${LEGAL_EMAIL}. We respond within a reasonable timeframe and may need to verify your identity before processing your request.`,
  },
];

export default function PrivacyPage() {
  return (
    <PageShell
      slug={SLUG}
      title="NewWheels privacy policy"
      tagline="Privacy & PIPEDA"
      intro={`Last Updated: ${LAST_UPDATED}. This policy describes how NewWheels collects, uses, discloses, and retains personal information. NewWheels operates in compliance with the Personal Information Protection and Electronic Documents Act (PIPEDA) and is governed by the laws of the Province of Alberta.`}
      breadcrumb={[{ name: "Privacy", path: SLUG }]}
      faq={FAQ}
      ctaHeading="Still want to apply? Go ahead."
      internalLinks={[
        { href: "/", label: "Back to homepage" },
        { href: "/terms", label: "Website Terms of Use" },
        { href: "/how-it-works", label: "How it works" },
        { href: "/about", label: "About NewWheels" },
      ]}
    >
      <h2>1. Your consent</h2>
      <p>
        By submitting an application or otherwise providing NewWheels with your personal
        information, you consent to the collection, use, disclosure and retention of that
        information by NewWheels in accordance with this Privacy Policy and as otherwise
        permitted by applicable law. You may withdraw your consent at any time by contacting
        us at{" "}
        <a className="underline" href={`mailto:${LEGAL_EMAIL}`}>
          {LEGAL_EMAIL}
        </a>
        , subject to legal or contractual restrictions and reasonable notice, but withdrawal
        of consent may limit our ability to process your application or provide our services
        to you.
      </p>

      <h2>2. What is personal information</h2>
      <p>
        Personal information means information about an identifiable individual, including
        name, phone number, email address, employment status, income, visa or residency
        status, and credit situation as provided through our application form. It does not
        include publicly available information or aggregated non-identifying data.
      </p>

      <h2>3. Information we collect</h2>
      <p>
        <strong>(a) Information You Provide:</strong> When you submit an application through
        newwheels.ca, you voluntarily provide personal information including your name,
        phone number, email address, employment details, income, current visa or residency
        status, and your credit situation. You may choose not to provide certain information
        but this may limit our ability to match you with a financing partner.
      </p>
      <p>
        <strong>(b) Automated Collection:</strong> NewWheels automatically collects certain
        information when you use our website, including browser type, device, operating
        system, pages visited, and timestamps. We use Google Analytics 4, Google Tag
        Manager, Facebook Pixel, and Microsoft Clarity to collect this information for the
        purpose of improving our services, understanding user behaviour, and delivering
        relevant advertising. These tools may use cookies, pixels, and session recording
        technologies. You may disable cookies through your browser settings, though this may
        affect your experience on the site.
      </p>
      <p>
        <strong>(c) Credit Information:</strong> NewWheels does not pull credit reports
        directly. However, dealer and lender partners to whom we refer your application may
        obtain credit reports as part of their own application and approval process. By
        submitting an application you acknowledge and consent to this possibility.
      </p>
      <p>
        <strong>(d) Referred Transaction Information:</strong> If a dealer or lender partner
        provides us with information about the outcome of a referred transaction, we may
        collect and retain that information to improve our matching process.
      </p>

      <h2>4. How we use your information</h2>
      <p>
        NewWheels uses your personal information to match your application with appropriate
        dealer and lender partners, to contact you regarding your application status, to
        send you relevant information about vehicle financing options, to improve our
        platform and services, to comply with legal obligations, and to protect our legal
        rights and the rights of our users.
      </p>

      <h2>5. How we share your information</h2>
      <p>
        <strong>(a) Dealer and Lender Partners:</strong> NewWheels may share your personal
        information, including the details you provided in your application, with
        Calgary-area dealer partners and automotive lenders for the purpose of facilitating
        your vehicle financing application. NewWheels has no responsibility or liability for
        the use, disclosure or retention of your personal information by any dealer or
        lender partner, and their handling of your information is governed by their own
        privacy policies.
      </p>
      <p>
        <strong>(b) Service Providers:</strong> NewWheels may share your information with
        service providers who assist us in operating our platform, including email delivery
        services, CRM tools, analytics providers, and advertising platforms, to the extent
        necessary for those services.
      </p>
      <p>
        <strong>(c) Legal Disclosure:</strong> NewWheels may disclose your personal
        information if required or authorized by applicable law, including to comply with a
        court order, subpoena, or legal obligation, or to protect the rights, safety, and
        interests of NewWheels or others.
      </p>
      <p>
        <strong>(d) Business Transactions:</strong> In the event of a sale, merger,
        acquisition or transfer of NewWheels or its assets, your personal information may be
        disclosed to the acquiring party, subject to equivalent privacy protections.
      </p>

      <h2>6. Consent on the form — important</h2>
      <p>
        A clear consent checkbox must appear directly below the application form on every
        page where the form appears. The checkbox text must read:
      </p>
      <blockquote>
        &ldquo;By submitting this form I consent to NewWheels collecting, using, and sharing
        my personal information with dealer and lender partners to facilitate my vehicle
        financing application, in accordance with the NewWheels Privacy Policy.&rdquo;
      </blockquote>
      <p>
        This checkbox must be unticked by default and required before submission. This is
        non-negotiable for PIPEDA compliance and protects us from liability.
      </p>

      <h2>7. Interest-based advertising</h2>
      <p>
        NewWheels uses Facebook Pixel and Google Analytics 4 to show relevant advertisements
        to users who have visited our site. These platforms may use cookies or similar
        technologies to deliver targeted ads on third-party sites. You may opt out of
        Google&apos;s use of cookies at{" "}
        <a
          className="underline"
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          google.com/settings/ads
        </a>
        . You may opt out of Facebook&apos;s advertising tools through your Facebook
        settings or the Network Advertising Initiative opt-out page at{" "}
        <a
          className="underline"
          href="https://optout.networkadvertising.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          optout.networkadvertising.org
        </a>
        .
      </p>

      <h2>8. Data retention</h2>
      <p>
        NewWheels retains your personal information for as long as reasonably necessary to
        fulfill the purposes described in this Privacy Policy, to comply with legal
        obligations, or to enforce our legal rights. When information is no longer needed,
        we delete or anonymize it.
      </p>

      <h2>9. Protection of your information</h2>
      <p>
        NewWheels uses reasonable administrative, physical, and technical safeguards to
        protect your personal information from unauthorized access, use, or disclosure. No
        security system is perfect and we cannot guarantee absolute security.
      </p>

      <h2>10. Your rights</h2>
      <p>
        You have the right to request access to, correction of, or deletion of your personal
        information held by NewWheels. To make a request, contact our privacy team at{" "}
        <a className="underline" href={`mailto:${LEGAL_EMAIL}`}>
          {LEGAL_EMAIL}
        </a>
        . We will respond within a reasonable timeframe and may need to verify your identity
        before processing your request.
      </p>

      <h2>11. PIPEDA compliance</h2>
      <p>
        NewWheels operates in compliance with the Personal Information Protection and
        Electronic Documents Act (PIPEDA), Canada&apos;s federal private-sector privacy law.
        For privacy-related inquiries contact{" "}
        <a className="underline" href={`mailto:${LEGAL_EMAIL}`}>
          {LEGAL_EMAIL}
        </a>
        .
      </p>

      <h2>12. Changes to this policy</h2>
      <p>
        NewWheels may update this Privacy Policy at any time by posting a revised version at
        newwheels.ca/privacy. The date at the top of this page reflects the most recent
        update. Your continued use of the site after any change constitutes acceptance of
        the updated policy.
      </p>

      <h2>13. Contact</h2>
      <p>
        NewWheels
        <br />
        Calgary, Alberta, Canada
        <br />
        <a className="underline" href={`mailto:${LEGAL_EMAIL}`}>
          {LEGAL_EMAIL}
        </a>
        <br />
        {LEGAL_PHONE}
      </p>
    </PageShell>
  );
}
