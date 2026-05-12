import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

const SLUG = "/car-loan-after-bankruptcy-calgary";

export const metadata: Metadata = buildMetadata({
  title: "Car Loan After Bankruptcy Calgary — Discharged or In-Process",
  description:
    "Car loans in Calgary after bankruptcy — discharged or in-process. Honest rate expectations, realistic timelines, and a credit-rebuild plan from day one.",
  path: SLUG,
});

const FAQ = [
  {
    question: "How long after bankruptcy can I get a car loan in Calgary?",
    answer:
      "You can apply immediately after discharge — many Calgary subprime lenders approve discharged bankruptcies in the same week. In-process bankruptcies require trustee approval but are still financeable.",
  },
  {
    question: "Do I need to be fully discharged to apply?",
    answer:
      "No. Discharged files approve faster, but if you're still in your bankruptcy period we can submit with a written letter from your trustee.",
  },
  {
    question: "What rates should I realistically expect after bankruptcy?",
    answer:
      "Honestly, 14–19% for the first loan after discharge. Pay on time for 12 months and we refinance you into the 7–10% range. Anyone in Calgary promising prime rates immediately after bankruptcy is misleading you.",
  },
  {
    question: "Will a bankruptcy disqualify me from any car?",
    answer:
      "It limits but doesn't eliminate. You'll usually qualify for vehicles under $40,000 with reasonable mileage. A bigger down payment expands what you can buy.",
  },
  {
    question: "How does the credit rebuild work?",
    answer:
      "We structure a 60-month loan with a payment that fits your budget so you never miss a date. After 12 months of perfect payments your bureau shows the new trade-line and your score jumps 100+ points. We then refinance.",
  },
  {
    question: "Can I get a Nissan after bankruptcy in Calgary?",
    answer:
      "Yes. South Trail Nissan has approved discharged bankruptcies on new Sentras and pre-owned Rogues. The vehicle type matters less than the loan structure.",
  },
];

export default function Page() {
  return (
    <PageShell
      slug={SLUG}
      title="Car loans after bankruptcy in Calgary"
      tagline="After bankruptcy"
      intro="Calgary's energy economy puts more people into bankruptcy than any major city in Canada outside Toronto. We understand that. Your bankruptcy isn't a character flaw — it's a financial event. Lenders care about behaviour after discharge, not the discharge itself."
      breadcrumb={[{ name: "After Bankruptcy", path: SLUG }]}
      faq={FAQ}
      ctaHeading="Bankruptcy or proposal in your past? Apply free."
      internalLinks={[
        { href: "/consumer-proposal-car-loan-calgary", label: "Consumer proposal car loans" },
        { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans Calgary" },
        { href: "/calculator", label: "Estimate your subprime payment →" },
        { href: "/blog", label: "Read our credit-rebuild guides" },
      ]}
    >
      <h2>Honest timeline for Calgary post-bankruptcy buyers</h2>
      <ul>
        <li><strong>Day 1 after discharge.</strong> Some lenders approve immediately. Expect 17–19%.</li>
        <li><strong>3 months post-discharge with 1 paid trade-line.</strong> Rate drops to 14–17%.</li>
        <li><strong>12 months of on-time car payments.</strong> Score has typically jumped 80–120 points. We refinance into 8–11%.</li>
        <li><strong>24 months of clean history.</strong> Prime territory. 6–9% on a refinance.</li>
      </ul>

      <h2>If you&apos;re still in your bankruptcy period</h2>
      <p>
        You can still finance a vehicle. You&apos;ll need written trustee approval — most
        trustees grant it routinely if the payment is reasonable. The rate will be in the
        18–22% range. We&apos;ll only recommend this route if you genuinely need a vehicle for
        employment or family reasons; for buyers who can wait 6 months for discharge, waiting
        usually saves several thousand dollars.
      </p>

      <h2>What to do in the 30 days before applying</h2>
      <ol>
        <li>Get your discharge certificate. We need a copy.</li>
        <li>Pay your phone bill, hydro, and rent on time for at least 90 days. These show on alternative credit reports.</li>
        <li>Open one secured credit card if you don&apos;t have any active trade-lines. Even $300 limit helps.</li>
        <li>Save $1,000–2,500 for a down payment. It will dramatically improve your rate.</li>
      </ol>

      <h2>What you should not do</h2>
      <p>
        Don&apos;t take a buy-here-pay-here lot deal at 29.99%. Those exist in Calgary because
        post-bankruptcy buyers are desperate, but they&apos;re predatory. A real subprime
        lender through NewWheels is half the rate and reports to the bureau (which a
        buy-here-pay-here usually doesn&apos;t), so it actually rebuilds your credit. That&apos;s
        the entire point.
      </p>
    </PageShell>
  );
}
