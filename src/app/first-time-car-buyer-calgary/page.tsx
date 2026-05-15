import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

const SLUG = "/first-time-car-buyer-calgary";

export const metadata: Metadata = buildMetadata({
  title: "First Time Car Buyer Calgary | No Credit, First Vehicle",
  description:
    "First-time car buyers in Calgary. Students, young professionals, newcomers. No credit needed. We explain every line of the deal. No upsells, no tricks.",
  path: SLUG,
});

const FAQ = [
  {
    question: "Can a first-time buyer with no credit get a car loan in Calgary?",
    answer:
      "Yes. Calgary lenders have specific first-time-buyer programs. You don't need credit history. You need stable employment or income, and a Calgary address.",
  },
  {
    question: "What rate should a first-time buyer in Calgary expect?",
    answer:
      "Without any credit, expect 8-12% on a new vehicle (the manufacturer programs subsidise newcomers and first-time buyers) and 10-14% on used.",
  },
  {
    question: "How much should I put down as a first-time buyer?",
    answer:
      "5-10% of the vehicle price is ideal. It demonstrates savings discipline to the lender and lowers your monthly payment.",
  },
  {
    question: "Should I buy new or used as a first-time buyer in Calgary?",
    answer:
      "If you can stretch to new, the manufacturer financing programs often beat used-vehicle rates. The Nissan Sentra through our dealer partners is a common first-time-buyer pick. Used is fine if you stay under 60,000 km.",
  },
  {
    question: "What documents do I need as a first-time buyer in Calgary?",
    answer:
      "Driver's licence, recent paystub or job offer, lease or utility bill, and proof of insurance. We help you set up insurance if you've never had a policy.",
  },
  {
    question: "What about insurance. Am I going to pay a fortune as a first-time driver?",
    answer:
      "Alberta insurance rates for first-time drivers are real, typically $200-400/month. We connect you to Calgary brokers who specialise in first-time policies before you sign anything.",
  },
];

export default function Page() {
  return (
    <PageShell
      slug={SLUG}
      title="First-time car buyer in Calgary: no credit, no problem"
      tagline="First-time buyers"
      intro="University of Calgary and SAIT graduates, first jobs, freshly-landed PRs. Calgary's a city of first-time car buyers. We get more of you approved than any broker in Calgary. We also tell you, in plain English, exactly how much insurance, registration, and maintenance will cost so the monthly payment isn't a surprise."
      breadcrumb={[{ name: "First-Time Buyer", path: SLUG }]}
      faq={FAQ}
      ctaHeading="Your first car? Let's get it right."
      internalLinks={[
        { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans" },
        { href: "/calculator", label: "Estimate your payment →" },
        { href: "/nissan-financing-calgary", label: "Nissan financing for first-time buyers" },
        { href: "/how-it-works", label: "How the 3-step process works" },
      ]}
    >
      <h2>The Calgary first-time buyer roadmap</h2>
      <ol>
        <li><strong>Pick a realistic budget.</strong> Total monthly cost (loan + insurance + fuel + maintenance) should be under 15% of your take-home pay.</li>
        <li><strong>Save a down payment.</strong> Even $1,000 makes a difference. $2,000-3,000 is ideal.</li>
        <li><strong>Apply with NewWheels.</strong> We submit to the lender most likely to approve a first-time file at the best rate. One inquiry, not five.</li>
        <li><strong>Pick the vehicle.</strong> We don&apos;t push specific units. We tell you what fits your budget and let you decide.</li>
        <li><strong>Build credit.</strong> 12 months of on-time payments will put your bureau score into the 700s, and then you can refinance into prime.</li>
      </ol>

      <h2>What we wish more first-time Calgary buyers knew</h2>
      <ul>
        <li>
          <strong>Don&apos;t buy at the dealership F&amp;I desk without comparing.</strong> Dealership finance offices add 2-4% to the lender&apos;s rate as their margin. We negotiate that out.
        </li>
        <li>
          <strong>Skip the extended warranty unless you keep the car 7+ years.</strong> Most new Nissans come with a 5-year/100,000 km bumper-to-bumper. Don&apos;t buy what you already have.
        </li>
        <li>
          <strong>Avoid the &quot;gap insurance&quot; upsell on used cars.</strong> Useful on new, marginal on used. The dealership margin is huge here.
        </li>
        <li>
          <strong>Get insurance quotes before you pick the car.</strong> A 22-year-old with no claims history pays double for a sports coupe vs. a sedan. We&apos;ve seen people&apos;s insurance be more than their car payment.
        </li>
      </ul>

      <h2>Why first-time buyers come to NewWheels instead of the dealership</h2>
      <p>
        Because we don&apos;t make money on upsells. Our income comes from the lender on the
        backend, the same way it works at every major Canadian broker. We don&apos;t need to
        sell you a $4,000 paint protection package or a $2,500 anti-theft etching service to
        make the deal work. That&apos;s the AMVIC standard, and that&apos;s how we keep
        first-time buyers as lifelong customers.
      </p>
    </PageShell>
  );
}
