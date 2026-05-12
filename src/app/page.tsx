import Link from "next/link";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Faq from "@/components/Faq";
import CtaBlock from "@/components/CtaBlock";
import JsonLd from "@/components/JsonLd";
import {
  faqSchema,
  localBusinessSchema,
  organizationSchema,
  websiteSchema,
} from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { SITUATION_NAV } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Car Loans Calgary — No Credit, Bad Credit, Newcomers Welcome",
  description:
    "Calgary car loans approved in 24 hours. Bad credit, newcomers, work permits, self-employed welcome. Up to 6 months of payments covered. Apply free.",
  path: "/",
});

const FAQ = [
  {
    question: "Can I get a car loan in Calgary with no Canadian credit?",
    answer:
      "Yes. NewWheels works with lenders that approve newcomers without Canadian credit history. Work permits, study permits, and permanent residents all qualify. You apply free with no hard credit check.",
  },
  {
    question: "How fast is approval?",
    answer:
      "Most applicants get an answer within 24 hours. A specialist calls within 1 hour of your application during business hours.",
  },
  {
    question: "Does NewWheels really cover 6 months of payments?",
    answer:
      "On qualified deals NewWheels covers up to 6 months of payments. The exact amount depends on the deal structure — your specialist explains the terms in plain language when you apply.",
  },
  {
    question: "Will applying hurt my credit score?",
    answer:
      "No. Applying with NewWheels is a soft inquiry — it doesn't affect your credit score. Only a final lender submission triggers a hard pull, and that only happens after you confirm the terms.",
  },
  {
    question: "What if I've had a bankruptcy or consumer proposal?",
    answer:
      "We finance both discharged and in-process bankruptcies, and active or completed consumer proposals. Bring your trustee paperwork and we'll match you with a lender that specialises in your situation.",
  },
  {
    question: "Can I get a new Nissan through NewWheels?",
    answer:
      "Yes. Hammad works at South Trail Nissan, so brand-new 2026 Nissans — Rogue, Kicks, Sentra, Armada — are available alongside our full pre-owned inventory.",
  },
];

const VEHICLES = [
  { name: "Nissan Rogue", note: "From $99/week on qualified deals." },
  { name: "Nissan Kicks", note: "0% financing programs available." },
  { name: "Nissan Sentra", note: "Top pick for first-time Calgary buyers." },
  { name: "Pre-owned trucks", note: "Trades, oil and gas, and contractor approvals." },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[localBusinessSchema(), websiteSchema(), organizationSchema(), faqSchema(FAQ)]}
      />
      <Hero />
      <TrustBar />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">
            The NewWheels offer
          </p>
          <h2 className="mt-2 text-3xl font-bold text-brand-ink md:text-4xl">
            Real approvals. Real Calgary specialist. Up to 6 months of payments covered.
          </h2>
          <p className="mt-3 text-neutral-700">
            AutoNova and the big online brokers will run your file through an algorithm. We
            won&apos;t. Hammad reviews every application personally, picks the right lender for
            your file, and tells you the truth about your rate up front — even if it&apos;s not
            what you wanted to hear.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "1. Apply free",
              body: "Fill the form. 90 seconds. No hard credit check, no obligation.",
            },
            {
              title: "2. Hammad calls you",
              body: "Within 1 hour during business hours. We confirm your details and your goals.",
            },
            {
              title: "3. Drive in 24–72 hours",
              body: "We submit to the right lender, get approval, finalise paperwork, hand you the keys.",
            },
          ].map(step => (
            <div key={step.title} className="rounded-2xl border border-brand-line bg-white p-6 shadow-card">
              <p className="text-lg font-bold text-brand-primary">{step.title}</p>
              <p className="mt-2 text-neutral-700">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-muted">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">
                Built for every Calgary situation
              </p>
              <h2 className="mt-2 text-3xl font-bold text-brand-ink md:text-4xl">
                We have a dedicated page for your exact situation.
              </h2>
              <p className="mt-3 text-neutral-700">
                We don&apos;t do generic financing. Pick the page that matches your situation —
                each one is written by Hammad, with realistic timelines, document lists, and
                Calgary-specific context.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {SITUATION_NAV.map(p => (
                <li key={p.slug}>
                  <Link
                    href={p.slug}
                    className="block rounded-xl border border-brand-line bg-white p-4 transition hover:border-brand-primary hover:shadow-card"
                  >
                    <span className="font-semibold text-brand-primary">{p.shortTitle}</span>
                    <span className="mt-1 block text-sm text-neutral-700">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">
              The Calgary advantage
            </p>
            <h2 className="mt-2 text-3xl font-bold text-brand-ink md:text-4xl">
              New 2026 Nissans, through Hammad at South Trail Nissan.
            </h2>
            <p className="mt-3 text-neutral-700">
              Most Calgary brokers can&apos;t get you into a brand-new vehicle. We can — Hammad
              is on the floor at South Trail Nissan and brings every program promotion through
              NewWheels first.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/nissan-financing-calgary" className="btn-secondary">
                Nissan financing Calgary
              </Link>
              <Link href="/calculator" className="btn-ghost">Estimate my payment →</Link>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {VEHICLES.map(v => (
              <li
                key={v.name}
                className="rounded-xl border border-brand-line bg-white p-5 shadow-card"
              >
                <p className="font-semibold text-brand-ink">{v.name}</p>
                <p className="mt-1 text-sm text-neutral-700">{v.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Faq items={FAQ} />
      <CtaBlock
        heading="Apply free. Drive this week."
        body="It takes 2 minutes. We do all the lender work for you and we never charge an application fee."
      />
    </>
  );
}
