import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import Faq from "@/components/Faq";
import CtaBlock from "@/components/CtaBlock";
import AuthorBio from "@/components/AuthorBio";
import {
  breadcrumbSchema,
  faqSchema,
  localBusinessSchema,
  softwareApplicationSchema,
} from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";

const Calculator = dynamic(() => import("@/components/Calculator"));

export const metadata: Metadata = buildMetadata({
  title: "Car Loan Calculator Calgary | Estimate Your Monthly Payment",
  description:
    "Free Calgary car loan calculator. Estimate your monthly payment, rate range, total interest, and Alberta no-PST savings vs. BC and Ontario. Updates instantly.",
  path: "/calculator",
});

const FAQ = [
  {
    question: "How accurate is this Calgary car loan calculator?",
    answer:
      "It's an estimate. Your real rate depends on your credit profile, income, term, vehicle, and the lender we match you with. Apply free and we give you the real number within 24 hours.",
  },
  {
    question: "Why is Alberta cheaper than BC and Ontario on a car?",
    answer:
      "Alberta only charges 5% GST. BC adds 7% PST on top of GST (12% total). Ontario charges 13% HST. On a $30,000 vehicle that's about $2,100 in savings vs. BC and $2,400 vs. Ontario, before financing.",
  },
  {
    question: "What loan term should I pick in Calgary?",
    answer:
      "Most Calgary buyers land at 60-72 months. 84 months keeps your payment lowest but you pay more interest. We help you pick the term that minimises lifetime cost given your goals.",
  },
  {
    question: "Does the calculator factor in the 6-months-covered offer?",
    answer:
      "No. The estimate is your raw monthly cost. The 6 months covered offer is applied separately on qualified deals. We explain it on the call.",
  },
  {
    question: "Can I get this rate range if I have bad credit?",
    answer:
      "The Poor and Bankruptcy/Proposal options reflect realistic Calgary subprime rates. Better credit ranges (Excellent, Good) only apply if your score and income support them.",
  },
  {
    question: "What's the smallest down payment NewWheels will accept?",
    answer:
      "On qualifying deals we can do $0 down. The right down payment is usually 5-10% of the vehicle price. It lowers your monthly and improves your rate.",
  },
];

export default function CalculatorPage() {
  return (
    <>
      <JsonLd
        data={[
          localBusinessSchema(),
          softwareApplicationSchema(),
          faqSchema(FAQ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Calculator", path: "/calculator" },
          ]),
        ]}
      />
      <article className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-[#9CA3AF]">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="hover:text-[#111111]">Home</Link></li>
            <li className="flex items-center gap-1"><span aria-hidden="true">&rsaquo;</span> <span>Calculator</span></li>
          </ol>
        </nav>

        <p className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">
          Calgary car loan calculator
        </p>
        <h1 className="mt-1 text-3xl font-bold leading-tight md:text-4xl">
          Estimate your monthly payment in Calgary. Alberta no-PST savings included.
        </h1>
        <p className="mt-3 max-w-prose text-lg text-[#6B7280]">
          Move the sliders. Pick your credit situation. The estimate updates instantly. No
          page reload, no calling first. When you&apos;re ready, apply free and Hammad gets you
          the real numbers within 24 hours.
        </p>

        <div className="mt-8">
          <Calculator />
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-[1fr_400px]">
          <div className="prose-content">
            <h2 className="text-xl font-bold">How this calculator works</h2>
            <p className="mt-2 text-[#6B7280]">
              We take your vehicle price, add Alberta&apos;s 5% GST, subtract your down payment,
              and apply the realistic rate range for your credit situation. The result is your
              estimated monthly payment over the loan term you pick. We also compute total
              interest over the life of the loan and your savings vs. BC and Ontario where
              sales tax is 12% or 13%. Alberta is the only province with no PST and on a
              $30,000 vehicle that&apos;s about $2,100 in tax you don&apos;t pay.
            </p>
            <h2 className="mt-6 text-xl font-bold">Why we show a range, not one number</h2>
            <p className="mt-2 text-[#6B7280]">
              Every Canadian auto lender uses a different rate sheet. Two buyers with the same
              credit score can land at different rates depending on income stability, the
              vehicle (new vs. used), the loan-to-value ratio, and even the season. We show a
              realistic range so you can plan honestly. When you apply we match you to the
              lender most likely to give you the bottom of that range.
            </p>
            <h2 className="mt-6 text-xl font-bold">Tip: pick your term carefully</h2>
            <p className="mt-2 text-[#6B7280]">
              A 60-month loan costs more per month than 84 months but you pay thousands less in
              interest. If you can afford a 5-year term, take it. If you need a 7-year term to
              fit the payment in your budget that&apos;s fine too. Just refinance later when
              your credit improves.
            </p>
            <div className="mt-10 rounded-xl border border-brand-line bg-[#F9F9F9] p-5">
              <p className="text-sm font-semibold text-[#111111]">Related pages</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                <li><Link className="text-[#111111] underline-offset-4 hover:underline" href="/bad-credit-car-loans-calgary">Bad credit car loans Calgary</Link></li>
                <li><Link className="text-[#111111] underline-offset-4 hover:underline" href="/newcomer-car-loans-calgary">Newcomer car loans Calgary</Link></li>
                <li><Link className="text-[#111111] underline-offset-4 hover:underline" href="/how-it-works">How it works</Link></li>
                <li><Link className="text-[#111111] underline-offset-4 hover:underline" href="/nissan-financing-calgary">Nissan financing Calgary</Link></li>
              </ul>
            </div>
            <div className="mt-10">
              <AuthorBio />
            </div>
          </div>
          <aside className="md:sticky md:top-24 md:self-start">
            <LeadForm sourcePage="/calculator" />
          </aside>
        </div>
      </article>
      <Faq items={FAQ} />
      <CtaBlock heading="Want the real numbers, not an estimate?" />
    </>
  );
}
