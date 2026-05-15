import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

const SLUG = "/how-it-works";

export const metadata: Metadata = buildMetadata({
  title: "How It Works | NewWheels Calgary Car Loan Approval Process",
  description:
    "How NewWheels approves Calgary car loans in 24 hours. The 3-step process, what our specialist does on your behalf, what you sign, and how 6-months-covered works.",
  path: SLUG,
});

const FAQ = [
  {
    question: "How does the NewWheels car loan approval process work in Calgary?",
    answer:
      "Three steps: apply free (90 seconds), a specialist calls within 1 hour, you drive the vehicle in 24-72 hours. We handle every lender submission, document collection, and dealership negotiation for you.",
  },
  {
    question: "What happens after I submit the application?",
    answer:
      "We review your file within the hour, ask any missing-detail questions on the phone, then submit to the lender most likely to approve at the best rate. You get approval terms within 24 hours.",
  },
  {
    question: "What does NewWheels do that I couldn't do myself?",
    answer:
      "Match your file to the right lender first time, instead of guessing. Negotiate the rate down on your behalf. Coordinate trustee letters and visa documentation. Handle dealership paperwork. And tell you when not to buy.",
  },
  {
    question: "How does the 6-months-covered offer actually work?",
    answer:
      "On qualified deals NewWheels structures the financing so your first 6 monthly payments are covered. We bake the cost into the deal structure so you genuinely don't pay for 6 months. Eligibility depends on the lender and the vehicle. Your specialist explains the exact mechanics.",
  },
  {
    question: "Do I have to come to a dealership?",
    answer:
      "Only when you sign final paperwork. Everything else happens by phone, text, email, or e-signature. Out-of-town buyers (Airdrie, Cochrane, Okotoks) routinely complete 95% of the process remotely.",
  },
  {
    question: "What if I'm declined?",
    answer:
      "We tell you why, and what to fix. Most declines are fixable in 30-90 days, usually a missing piece of documentation or a need for a co-signer. Real declines that we can't work around happen on fewer than 5% of applications.",
  },
];

export default function Page() {
  return (
    <PageShell
      slug={SLUG}
      title="How NewWheels approves a Calgary car loan in 24 hours"
      tagline="The process"
      intro="No mystery, no boiler-room sales. Three steps from application to keys, and a specialist personally walks every customer through them. Here's exactly what happens after you click 'apply'."
      breadcrumb={[{ name: "How it works", path: SLUG }]}
      faq={FAQ}
      ctaHeading="Ready to start? Apply free."
      internalLinks={[
        { href: "/about", label: "About NewWheels" },
        { href: "/calculator", label: "Estimate your payment first" },
        { href: "/privacy", label: "Our privacy policy" },
        { href: "/", label: "Back to homepage" },
      ]}
    >
      <h2>Step 1: Apply free (90 seconds)</h2>
      <p>
        Fill out the application on this site. We need eight pieces of information: name,
        phone, email, credit situation, employment, immigration status (if applicable),
        timeframe, and notes. No SIN, no banking, no hard credit pull. Submitting takes 90
        seconds.
      </p>
      <h3>What happens behind the scenes</h3>
      <ul>
        <li>The application reaches our team and lands in our CRM within 60 seconds.</li>
        <li>You receive an automated confirmation email at the address you provided.</li>
        <li>Your application is logged in our secure Google Sheets pipeline. Never sold, never shared.</li>
      </ul>

      <h2>Step 2: A specialist calls you (within 1 hour during business hours)</h2>
      <p>
        Real human, real Calgary number. The call takes 10-15 minutes. We confirm your details,
        ask follow-up questions, and tell you the realistic rate range you&apos;ll see, before
        we submit anywhere. You get a chance to ask anything.
      </p>
      <h3>Documents we ask for at this stage</h3>
      <ul>
        <li>Two pieces of ID (Alberta driver&apos;s licence + one other).</li>
        <li>Proof of income: recent paystub, 6 months bank statements (self-employed), or NOA.</li>
        <li>Proof of Calgary address: lease, utility bill, or bank statement.</li>
        <li>For newcomers: passport + permit document.</li>
        <li>For consumer proposal: trustee contact.</li>
      </ul>

      <h2>Step 3: Drive in 24-72 hours</h2>
      <p>
        We submit your file to the right lender (or two, if it&apos;s a close call). Approval
        comes back within 24 hours. We send you the terms in writing. If you accept, we
        coordinate vehicle delivery, either at our dealer partners if you&apos;re buying new,
        or at our partner pre-owned lots in Calgary. Final paperwork takes about 30 minutes.
        You drive away.
      </p>

      <h2>The 6-months-covered offer: how it actually works</h2>
      <p>
        We structure your financing so your first six monthly payments are pre-funded into the
        deal. You don&apos;t pay anything from month 1 to month 6. Then your normal payment
        schedule starts at month 7. The mechanism varies by lender and dealer. Sometimes
        we&apos;re absorbing a portion of the dealer holdback, sometimes a manufacturer
        program covers it. Your specialist explains the exact math during your call.
      </p>
      <p>
        Eligibility: qualified deals only. Most newcomers with stable employment qualify. Bad
        credit with $3K+ down payment qualifies. Some files don&apos;t, and we tell you up front.
      </p>

      <h2>What we charge you</h2>
      <p>
        Nothing. NewWheels is paid by the lender on the back end of the loan, which is the
        standard model for every legitimate broker in Canada. We never charge an application
        fee, a documentation fee, or a placement fee. If anyone in Calgary asks you for an
        upfront fee, walk away.
      </p>
    </PageShell>
  );
}
