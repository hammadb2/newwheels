import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

const SLUG = "/car-loan-work-permit-calgary";

export const metadata: Metadata = buildMetadata({
  title: "Work Permit Car Loan Calgary — LMIA, PGWP, TFW Approved",
  description:
    "Calgary car loans for work-permit holders. LMIA, open, PGWP, TFW — each has a different lender. We pick the right one. 24-hour approval, no Canadian credit.",
  path: SLUG,
});

const FAQ = [
  {
    question: "Can I get a car loan in Calgary on a work permit?",
    answer:
      "Yes. Calgary lenders have dedicated work-permit programs. The lender we use depends on your permit type — open work permits, employer-specific LMIA, PGWP, and TFW each route to different programs.",
  },
  {
    question: "Do I need 24 months left on my work permit?",
    answer:
      "Most lenders want at least 12 months remaining on your permit, ideally matching the loan term. If you have less, we structure a shorter loan or a renewable-permit guarantee.",
  },
  {
    question: "I'm on a PGWP and just graduated from SAIT. Will I qualify?",
    answer:
      "PGWP holders are one of the strongest newcomer profiles. If you have full-time employment lined up — even a job that started last week — we can typically approve you at 8–13% with no Canadian credit history.",
  },
  {
    question: "What if my LMIA work permit is employer-specific?",
    answer:
      "Employer-specific permits actually help — they prove stable employment with a real Calgary employer. Bring your LMIA approval letter and most recent paystub.",
  },
  {
    question: "Can my spouse co-sign if they're on an open work permit?",
    answer:
      "Yes. A spousal co-sign on a Spouse Open Work Permit is fully accepted as long as combined income supports the payment.",
  },
  {
    question: "What's the maximum amortisation on a work-permit loan?",
    answer:
      "Up to 84 months, but we usually recommend 60 — it gets you debt-free before your permit renewal and protects you from any visa-related complications.",
  },
];

export default function Page() {
  return (
    <PageShell
      slug={SLUG}
      title="Car loans for work-permit holders in Calgary"
      tagline="Work permits"
      intro="LMIA, open work permit, PGWP, TFW — each visa type routes to a different lender with a different rate sheet. Most Calgary brokers send everyone to the same generic program. We don't. Here's the visa-by-visa playbook we use to get work-permit holders approved at the best rate available to your specific status."
      breadcrumb={[{ name: "Work Permit", path: SLUG }]}
      faq={FAQ}
      ctaHeading="On a work permit? Get approved in 24 hours."
      internalLinks={[
        { href: "/newcomer-car-loans-calgary", label: "Newcomer overview" },
        { href: "/first-time-car-buyer-calgary", label: "First-time buyer in Calgary" },
        { href: "/calculator", label: "Estimate your monthly payment →" },
        { href: "/how-it-works", label: "Our 3-step approval process" },
      ]}
    >
      <h2>Permit-by-permit lender breakdown</h2>
      <h3>LMIA / Employer-specific work permit</h3>
      <p>
        You have a named Canadian employer and at least 12 months left on the permit. Lenders
        treat your file as <em>thin-credit prime</em> — usually approved at 9–12% with $0–2,000
        down. Required documents: LMIA approval letter, permit, last 2 paystubs, lease, SIN.
      </p>
      <h3>Open work permit</h3>
      <p>
        Including Spousal Open Work Permit and Bridging Open Work Permit. Slightly higher
        scrutiny because of employment flexibility — but stable employment for 3+ months at
        one Calgary employer closes that gap fast. Expect 10–14% with 10% down.
      </p>
      <h3>PGWP (Post-Graduation Work Permit)</h3>
      <p>
        Strongest newcomer profile. SAIT and University of Calgary graduates land at 8–13%
        with as little as $500 down. If you completed your program in Calgary, mention the
        institution on your application — we&apos;ve seen lenders prioritise local grads.
      </p>
      <h3>TFW (Temporary Foreign Worker)</h3>
      <p>
        Hospitality, agriculture, and caregiver pathway TFWs. We route to the subprime newcomer
        program. Typical rates 13–17%. We strongly recommend 60-month max term so you&apos;re
        debt-free if you renew or transition.
      </p>

      <h2>What to do <em>before</em> applying</h2>
      <ul>
        <li>Make sure your SIN is renewed if it&apos;s expiring with your permit.</li>
        <li>Get your Alberta Class 7 learner&apos;s permit if you don&apos;t have a Canadian licence yet.</li>
        <li>Confirm your job offer in writing on company letterhead — verbal offers don&apos;t count.</li>
        <li>Don&apos;t apply at multiple brokers in the same week. Each is a hard inquiry.</li>
      </ul>

      <h2>What we&apos;ll need from you</h2>
      <ol>
        <li>Passport with current visa stamp.</li>
        <li>Permit document (LMIA letter, open permit, PGWP, etc.).</li>
        <li>SIN — temporary SINs are accepted.</li>
        <li>Last 2 paystubs <em>or</em> signed offer letter.</li>
        <li>Lease or utility bill showing Calgary address.</li>
        <li>Driver&apos;s licence — Alberta preferred, international acceptable.</li>
      </ol>
    </PageShell>
  );
}
