import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

const SLUG = "/consumer-proposal-car-loan-calgary";

export const metadata: Metadata = buildMetadata({
  title: "Consumer Proposal Car Loan Calgary | Active or Completed",
  description:
    "Car loans during or after a consumer proposal in Calgary. Active R7 or completed. Both finance. Trustee letters handled. Honest rates, no false promises.",
  path: SLUG,
});

const FAQ = [
  {
    question: "Can I get a car loan during an active consumer proposal in Calgary?",
    answer:
      "Yes. Calgary subprime lenders finance active proposals routinely. You'll need a letter from your trustee approving the new debt. Most trustees provide it within a week.",
  },
  {
    question: "What's an R7 on my credit report?",
    answer:
      "R7 is the credit bureau code for an active consumer proposal. It stays on your bureau for 3 years after completion. Lenders see it instantly. There's no hiding it, and we don't try.",
  },
  {
    question: "What rate should I expect during an active proposal?",
    answer:
      "Honestly, 16-21%. After completion, rates drop to 12-16%. After two years of clean payments post-completion, prime territory opens up again.",
  },
  {
    question: "Do I need my trustee's permission for a car loan during a proposal?",
    answer:
      "Yes. Your trustee has to approve any new debt over a small threshold. We handle the communication and provide the lender quote in the format trustees expect.",
  },
  {
    question: "Will a car loan break my consumer proposal?",
    answer:
      "Only if you can't keep up with both. We size the car payment so the combined monthly (proposal payment + car payment) stays manageable. We've never seen a NewWheels-financed buyer default during their proposal.",
  },
  {
    question: "Can I buy a Nissan during a consumer proposal in Calgary?",
    answer:
      "Yes. Pre-owned Nissans through our dealer partners are commonly approved during proposals. New vehicles are tougher but possible with a larger down payment.",
  },
];

export default function Page() {
  return (
    <PageShell
      slug={SLUG}
      title="Car loans during or after a consumer proposal in Calgary"
      tagline="Consumer proposal"
      intro="Active R7 on your bureau or just-completed proposal. Both finance in Calgary. The lender list is shorter and the rates are higher, but the path forward is real. We coordinate with your trustee, we explain the rate honestly, and we structure the payment so you don't risk your proposal."
      breadcrumb={[{ name: "Consumer Proposal", path: SLUG }]}
      faq={FAQ}
      ctaHeading="Mid-proposal in Calgary? Still drivable."
      internalLinks={[
        { href: "/car-loan-after-bankruptcy-calgary", label: "Car loan after bankruptcy" },
        { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans Calgary" },
        { href: "/calculator", label: "Estimate your monthly payment →" },
        { href: "/how-it-works", label: "How it works" },
      ]}
    >
      <h2>Active proposal vs. completed proposal: they finance differently</h2>
      <p>
        Lenders see them differently. An active R7 means you&apos;re still paying down agreed
        creditors. A completed proposal (R7 still on bureau, but with a completion date) is
        almost identical to a discharged bankruptcy from a lender&apos;s perspective. The lender
        list and rate sheet are not the same for the two.
      </p>
      <h3>If you&apos;re actively in a proposal</h3>
      <ul>
        <li>We need your most recent proposal statement.</li>
        <li>Your trustee will write a letter approving the new debt.</li>
        <li>Rates run 16-21% depending on income and the lender.</li>
        <li>We strongly recommend a 60-month max term. Keeps total cost down.</li>
      </ul>
      <h3>If your proposal is complete</h3>
      <ul>
        <li>We need your discharge / completion certificate.</li>
        <li>No trustee letter required.</li>
        <li>Rates run 12-16%.</li>
        <li>Refinance opportunity at 12 months of clean payments.</li>
      </ul>

      <h2>How we coordinate with your trustee</h2>
      <p>
        Calgary&apos;s major trustees (MNP, BDO, Grant Thornton, A. Farber) all have a
        standard format for car-loan approval requests. We send them the lender&apos;s
        pre-approval terms, the monthly payment, and the loan term. The trustee responds in
        2-7 business days with either an approval letter or a request to modify the structure.
        It&apos;s routine.
      </p>

      <h2>What to do during your proposal to make the next car loan easier</h2>
      <ol>
        <li>Pay your proposal payment every month, on time, without exception.</li>
        <li>Open one secured credit card to add a positive trade-line to your bureau.</li>
        <li>Save $1,500-3,000 as a down payment.</li>
        <li>Don&apos;t apply at multiple Calgary brokers. One inquiry only.</li>
      </ol>

      <h2>What we won&apos;t do</h2>
      <p>
        We won&apos;t recommend buying mid-proposal if your debt-to-income is already maxed out.
        We won&apos;t put you in a car you can&apos;t afford to keep through the next 36 months.
        Defaulting on a car loan during a proposal can void the proposal and force a
        bankruptcy. The math has to work, and we say so when it doesn&apos;t.
      </p>
    </PageShell>
  );
}
