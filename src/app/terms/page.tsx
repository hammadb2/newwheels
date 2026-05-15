import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

const SLUG = "/terms";
const LEGAL_EMAIL = "legal@newwheels.ca";
const LAST_UPDATED = "May 2026";

export const metadata: Metadata = buildMetadata({
  title: "Website Terms of Use | NewWheels Calgary",
  description:
    "Terms of Use for newwheels.ca. NewWheels is a vehicle financing lead generation platform. Governed by the laws of the Province of Alberta and applicable federal laws of Canada.",
  path: SLUG,
  multilingual: false,
});

const FAQ = [
  {
    question: "Does using newwheels.ca guarantee me financing approval?",
    answer:
      "No. Submitting an application does not guarantee financing approval. Approval decisions are made solely by the dealer or lender partner to whom your application is referred.",
  },
  {
    question: "Is NewWheels a dealership or lender?",
    answer:
      "No. NewWheels is a vehicle financing lead generation platform. We are not a dealership, lender, broker, or financial institution. We do not offer loans, approve financing, or sell vehicles.",
  },
  {
    question: "Which law governs these terms?",
    answer:
      "These Terms are governed by the laws of the Province of Alberta, Canada, and applicable federal laws of Canada. Disputes will be resolved in the courts of Alberta.",
  },
];

export default function TermsPage() {
  return (
    <PageShell
      slug={SLUG}
      title="NewWheels website terms of use"
      tagline="Terms of Use"
      intro={`Last Updated: ${LAST_UPDATED}. Please read these Terms of Use carefully before using this website. By using newwheels.ca you acknowledge that you have read, understood and agree to these Terms. If you do not agree, do not use this site.`}
      breadcrumb={[{ name: "Terms", path: SLUG }]}
      faq={FAQ}
      ctaHeading="Ready to apply? Go ahead."
      internalLinks={[
        { href: "/", label: "Back to homepage" },
        { href: "/privacy", label: "Privacy policy" },
        { href: "/how-it-works", label: "How it works" },
        { href: "/about", label: "About NewWheels" },
      ]}
    >
      <p>
        <strong>
          PLEASE READ THESE TERMS OF USE CAREFULLY BEFORE USING THIS WEBSITE. BY USING
          NEWWHEELS.CA YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD AND AGREE TO THESE
          TERMS. IF YOU DO NOT AGREE, DO NOT USE THIS SITE.
        </strong>
      </p>

      <h2>1. Acceptance</h2>
      <p>
        These Terms of Use are a binding agreement between you and NewWheels regarding your
        access to and use of newwheels.ca. Each time you use the site you agree to the most
        current version of these Terms.
      </p>

      <h2>2. Nature of service</h2>
      <p>
        NewWheels is a vehicle financing lead generation platform. We are not a dealership,
        lender, broker, or financial institution. We do not offer loans, approve financing,
        or sell vehicles. We connect applicants with AMVIC-licensed dealer partners and
        automotive lenders in Calgary and Alberta who provide their own financing products
        and services. Any financing offer, approval, rate, or term comes from the dealer or
        lender directly, not from NewWheels.
      </p>

      <h2>3. No guarantee of approval</h2>
      <p>
        Submitting an application through newwheels.ca does not guarantee financing
        approval. Approval decisions are made solely by the dealer or lender partner to whom
        your application is referred. NewWheels makes no representation or warranty that any
        applicant will be approved for financing.
      </p>

      <h2>4. Information accuracy</h2>
      <p>
        The content on newwheels.ca is provided for general informational purposes only.
        Payment estimates, rate examples, and financing scenarios shown on the site are
        illustrative only and do not constitute a financing offer or commitment. Actual
        rates, payments, and terms will be determined by the dealer or lender partner based
        on your individual application.
      </p>

      <h2>5. Disclaimer of warranties</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, NEWWHEELS.CA IS PROVIDED ON AN
        &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT ANY WARRANTIES OR
        CONDITIONS OF ANY KIND, EXPRESS OR IMPLIED. NEWWHEELS MAKES NO WARRANTY THAT THE
        SITE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, NEWWHEELS AND ITS TEAM, PARTNERS,
        AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
        CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THIS SITE, YOUR
        APPLICATION, OR ANY INTERACTION WITH A DEALER OR LENDER PARTNER TO WHOM YOUR
        APPLICATION IS REFERRED. THIS INCLUDES DAMAGES ARISING FROM FINANCING DECISIONS,
        CREDIT INQUIRIES, OR ANY ACTIONS TAKEN BY DEALER OR LENDER PARTNERS.
      </p>

      <h2>7. Referred businesses</h2>
      <p>
        NewWheels may refer you to independent dealer and lender partners. NewWheels does
        not endorse and has no responsibility or liability for any referred business, their
        products or services, or their handling of your personal information or
        application. Your dealings with any referred business are at your own risk.
      </p>

      <h2>8. Third party links</h2>
      <p>
        The site may contain links to third-party websites. NewWheels has no responsibility
        for those sites, their content, or their privacy practices. Use of any linked site
        is at your own risk.
      </p>

      <h2>9. Intellectual property</h2>
      <p>
        All content on newwheels.ca including text, graphics, logos, and design is the
        property of NewWheels. You may not reproduce, distribute, or use any content without
        prior written permission.
      </p>

      <h2>10. Changes to these terms</h2>
      <p>
        NewWheels may update these Terms at any time. Continued use of the site after any
        change constitutes acceptance. Check this page periodically for updates.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Province of Alberta, Canada, and
        applicable federal laws of Canada. Any disputes will be resolved in the courts of
        Alberta.
      </p>

      <h2>12. Contact</h2>
      <p>
        For legal inquiries:{" "}
        <a className="underline" href={`mailto:${LEGAL_EMAIL}`}>
          {LEGAL_EMAIL}
        </a>
        .
      </p>
    </PageShell>
  );
}
