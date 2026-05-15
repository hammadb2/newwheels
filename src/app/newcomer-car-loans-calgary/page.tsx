import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import HubSpokes from "@/components/HubSpokes";
import { buildMetadata } from "@/lib/seo";
import { newcomerSpokes } from "@/lib/hub-spokes";

const SLUG = "/newcomer-car-loans-calgary";

export const metadata: Metadata = buildMetadata({
  title: "Newcomer Car Loans Calgary | No Canadian Credit Needed",
  description:
    "Newcomer car loans in Calgary. No Canadian credit needed. Work permits, study permits, PR all welcome. 24-hour approval. Filipino & South Asian friendly.",
  path: SLUG,
});

const FAQ = [
  {
    question: "Can I get a car loan in Calgary with no Canadian credit history?",
    answer:
      "Yes. NewWheels works with Canadian lenders who have dedicated newcomer programs. They look at employment, income, and visa status, not just credit score.",
  },
  {
    question: "Do I need a SIN number to apply?",
    answer:
      "Yes. A valid SIN (starting with any digit, including 9-prefixed SINs for temporary residents) is required for any Canadian auto loan. We can guide you on how to get one if you've just arrived.",
  },
  {
    question: "What visa types are accepted for a newcomer car loan?",
    answer:
      "All of them. Work permits (open, LMIA, employer-specific), study permits, PGWP, permanent residence, and citizenship are all approved. We have a documentation guide per visa type.",
  },
  {
    question: "What documents do newcomers need to apply?",
    answer:
      "Passport, visa or permit document, SIN, proof of Calgary address (lease or utility bill), recent paystub or job offer letter, and Canadian driver's licence or international permit with a Class 7 learner's.",
  },
  {
    question: "How long does approval take for newcomers?",
    answer:
      "24 hours in most cases. PGWP holders and full-time employees usually approve fastest. Caregiver pathway and self-employed newcomers may need an extra 24 hours for income verification.",
  },
  {
    question: "Can I get a new vehicle or only used?",
    answer:
      "Both. Newcomer lenders fund new and used. Many newcomers actually qualify for new-vehicle programs because new-car rates are subsidised by the manufacturer.",
  },
];

export default function Page() {
  return (
    <PageShell
      slug={SLUG}
      title="Newcomer car loans in Calgary: no Canadian credit, no problem"
      tagline="Newcomers Calgary"
      intro="Calgary's Filipino, South Asian, Eritrean, Sudanese, and Latin American newcomer communities power this city. NewWheels approves newcomer car loans every day: work permit, study permit, PGWP, or freshly-landed PR. You don't need Canadian credit. You need a job and the right lender."
      breadcrumb={[{ name: "Newcomers", path: SLUG }]}
      faq={FAQ}
      ctaHeading="Welcome to Calgary. Let's get you driving."
      internalLinks={[
        { href: "/car-loan-work-permit-calgary", label: "Work-permit car loan guide" },
        { href: "/first-time-car-buyer-calgary", label: "First-time buyer in Calgary" },
        { href: "/calculator", label: "Estimate your newcomer payment →" },
        { href: "/nissan-financing-calgary", label: "Nissan financing through our dealer partners" },
      ]}
    >
      <p className="font-semibold italic text-[#6B7280]" lang="tl">
        Filipino newcomer? <span>Bagong dating sa Canada, kaya namin tulungan ka kahit walang Canadian credit history.</span>
      </p>

      <h2>The newcomer-lender shortlist, and which one fits your visa</h2>
      <p>
        New-to-Canada auto financing isn&apos;t one product. It&apos;s four products from four
        lenders, each with different documentation requirements and rate sheets. Sending your
        file to the wrong one wastes a week and burns a hard credit inquiry. We send to the
        right one the first time.
      </p>
      <ul>
        <li>
          <strong>PGWP holders (Post-Graduation Work Permit).</strong> Strongest profile.
          University of Calgary, SAIT, Bow Valley, Ambrose alumni go to the dedicated newcomer
          program, typically 8-13% with no Canadian credit required.
        </li>
        <li>
          <strong>LMIA / employer-specific work permits.</strong> Stable employment, often
          Filipino caregivers and oil-sector contract workers. Approved through a different
          newcomer lender that priorities job tenure.
        </li>
        <li>
          <strong>Open work permits and TFW.</strong> Approved through alternative-prime
          lenders. Down payment of 10-15% usually unlocks better terms.
        </li>
        <li>
          <strong>New permanent residents.</strong> Lenders treat your file like a domestic
          first-time buyer plus a thin-file flag. Approval is fast, usually under 24 hours.
        </li>
      </ul>

      <h2>The Calgary documentation list: bring these and we close in 48 hours</h2>
      <ol>
        <li>Passport with valid stamp or visa.</li>
        <li>Permit document (work permit, study permit, PR confirmation, or COPR/landing paper).</li>
        <li>Calgary lease, utility bill, or bank statement showing your address.</li>
        <li>SIN (temporary SINs starting with 9 are accepted).</li>
        <li>Most recent paystub <em>or</em> signed job offer letter on company letterhead.</li>
        <li>Canadian driver&apos;s licence, or an international permit paired with an Alberta Class 7 learner&apos;s.</li>
      </ol>

      <h2>Why Calgary&apos;s Filipino community trusts NewWheels</h2>
      <p>
        Filipinos are the largest newcomer community in Calgary. We&apos;ve worked with caregivers,
        nurses, hospitality workers, and PGWP graduates from SAIT and U of C. We respect that
        community. We don&apos;t talk down to applicants, we explain everything in plain
        English (and we can arrange a Tagalog speaker if it helps), and we don&apos;t
        upsell unnecessary warranties or insurance products you don&apos;t need.
      </p>

      <h2>What newcomers should not do</h2>
      <p>
        Don&apos;t apply at five places in a week. Each application is a hard credit pull and
        Canadian lenders see the pattern as a risk signal. Don&apos;t put $0 down if you can
        put $1,000. Even a small down payment dramatically improves your rate. And don&apos;t
        sign anything you don&apos;t understand. AMVIC mandates plain-language disclosure in
        Alberta and we hold ourselves to it.
      </p>

      <HubSpokes
        title="Newcomer financing across Calgary"
        intro="Pick the page that matches your neighbourhood, your make preference, or your visa pathway."
        groups={[
          {
            heading: "By Calgary neighbourhood",
            blurb: "Saddle Ridge, Martindale, and Falconridge see the heaviest newcomer volume.",
            spokes: newcomerSpokes().byLocation,
          },
          {
            heading: "By vehicle make",
            blurb: "Toyota and Honda dominate newcomer demand for resale and parts availability.",
            spokes: newcomerSpokes().byMake,
          },
        ]}
      />
    </PageShell>
  );
}
