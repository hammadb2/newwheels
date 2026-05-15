import Link from "next/link";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Faq from "@/components/Faq";
import CtaBlock from "@/components/CtaBlock";
import LeadForm from "@/components/LeadForm";
import JsonLd from "@/components/JsonLd";
import AuthorBio from "@/components/AuthorBio";
import {
  CalgaryDriveIllustration,
  FamilyRoadTripIllustration,
  NewcomerIllustration,
  ApprovalCardIllustration,
} from "@/components/Illustrations";
import {
  faqSchema,
  localBusinessWithRatingSchema,
  organizationSchema,
  reviewListSchema,
  websiteSchema,
} from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { SITUATION_NAV } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Car Loans Calgary | No Credit, Bad Credit, Newcomers Welcome",
  description:
    "Calgary car loans approved in 24 hours. Bad credit, newcomers, work permits, and self-employed welcome. Up to 6 months of payments covered. Apply free now.",
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
      "On qualified deals NewWheels covers up to 6 months of payments. The exact amount depends on the deal structure. Your specialist explains the terms in plain language when you apply.",
  },
  {
    question: "Will applying hurt my credit score?",
    answer:
      "No. Applying with NewWheels is a soft inquiry and it doesn't affect your credit score. Only a final lender submission triggers a hard pull, and that only happens after you confirm the terms.",
  },
  {
    question: "What if I've had a bankruptcy or consumer proposal?",
    answer:
      "We finance both discharged and in-process bankruptcies, and active or completed consumer proposals. Bring your trustee paperwork and we'll match you with a lender that specialises in your situation.",
  },
  {
    question: "Can I get a new Nissan through NewWheels?",
    answer:
      "Yes. Our specialist works directly with dealer partners, so brand-new 2026 Nissans (Rogue, Kicks, Sentra, Armada) are available alongside our full pre-owned inventory.",
  },
];

const VEHICLES = [
  { name: "Nissan Rogue", note: "From $99/week on qualified deals." },
  { name: "Nissan Kicks", note: "0% financing programs available." },
  { name: "Nissan Sentra", note: "Top pick for first-time Calgary buyers." },
  { name: "Pre-owned trucks", note: "Trades, oil and gas, and contractor approvals." },
];

const FEATURE_CARDS: Array<{
  badge: string;
  heading: string;
  body: string;
  cta: { href: string; label: string };
  bg: "cream" | "lime" | "white";
  Illustration: React.ComponentType<{ className?: string }>;
}> = [
  {
    badge: "Bad credit & rebuild",
    heading: "Approvals even when your score is rough.",
    body: "We work with sub-prime and prime lenders who care more about your full picture than a 3-digit number.",
    cta: { href: "/bad-credit-car-loans-calgary", label: "See bad-credit loans" },
    bg: "cream",
    Illustration: ({ className }) => <CalgaryDriveIllustration className={className} />,
  },
  {
    badge: "Newcomer to Canada",
    heading: "Your first Canadian car, on day one.",
    body: "Work permit, study permit, or brand-new PR? Lenders we work with approve newcomers without Canadian credit history.",
    cta: { href: "/newcomer-car-loans-calgary", label: "Newcomer loans" },
    bg: "lime",
    Illustration: ({ className }) => <NewcomerIllustration className={className} />,
  },
  {
    badge: "Family in Calgary",
    heading: "A vehicle big enough for everything ahead.",
    body: "Roadtrips, hockey practice, Costco runs. Up to 6 months of payments covered on qualified deals.",
    cta: { href: "/how-it-works", label: "How it works" },
    bg: "white",
    Illustration: ({ className }) => <FamilyRoadTripIllustration className={className} />,
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          localBusinessWithRatingSchema(),
          websiteSchema(),
          organizationSchema(),
          faqSchema(FAQ),
          ...reviewListSchema(),
        ]}
      />

      <Hero />
      <TrustBar />

      {/* ===== The NewWheels offer ===== */}
      <section className="bg-brand-cream">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:items-end">
            <div>
              <span className="chip">The NewWheels offer</span>
              <h2 className="display-headline mt-4 text-section font-extrabold uppercase text-brand-ink">
                Real approvals.
                <span className="block text-brand-forest">Real Calgary specialist.</span>
              </h2>
            </div>
            <p className="text-base text-brand-muted md:text-lg">
              AutoNova and the big online brokers will run your file through an algorithm. We
              won&apos;t. Our team reviews every application personally, picks the right lender for
              your file, and tells you the truth about your rate up front, even if it&apos;s not
              what you wanted to hear.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Apply free",
                body: "Fill the form. 90 seconds. No hard credit check, no obligation.",
              },
              {
                step: "02",
                title: "A specialist calls",
                body: "Within 1 hour during business hours. We confirm your details and your goals.",
              },
              {
                step: "03",
                title: "Drive in 24–72 hrs",
                body: "We submit to the right lender, get approval, finalise paperwork, hand you the keys.",
              },
            ].map(s => (
              <div
                key={s.step}
                className="rounded-4xl bg-white p-7 shadow-card ring-1 ring-brand-line"
              >
                <span className="font-display text-5xl font-extrabold text-brand-accent">
                  {s.step}
                </span>
                <p className="mt-4 text-xl font-bold text-brand-ink">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Feature cards (Koho-style trio) ===== */}
      <section className="bg-brand-creamSoft">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="chip">Built for you</span>
            <h2 className="display-headline mt-4 text-section font-extrabold uppercase text-brand-ink">
              Whatever your situation,
              <span className="block text-brand-forest">we have a plan.</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURE_CARDS.map(card => {
              const bg =
                card.bg === "lime"
                  ? "bg-brand-accent text-brand-ink"
                  : card.bg === "cream"
                  ? "bg-brand-cream text-brand-ink"
                  : "bg-white text-brand-ink";
              return (
                <article
                  key={card.heading}
                  className={`flex flex-col overflow-hidden rounded-4xl shadow-card ring-1 ring-brand-line ${bg}`}
                >
                  <card.Illustration className="aspect-square w-full" />
                  <div className="flex flex-1 flex-col p-7">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-forest">
                      {card.badge}
                    </span>
                    <h3 className="mt-3 text-xl font-extrabold leading-tight md:text-2xl">
                      {card.heading}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-brand-ink/75">
                      {card.body}
                    </p>
                    <Link
                      href={card.cta.href}
                      className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-bold text-brand-ink underline-offset-4 hover:underline"
                    >
                      {card.cta.label} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Lead form section (dedicated dark section) ===== */}
      <section id="apply" className="section-dark relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(217,255,78,0.9) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-[1fr_1.05fr] md:py-28">
          <div className="text-white">
            <span className="chip-dark">2 minutes · No hard pull</span>
            <h2 className="display-headline mt-4 text-section font-extrabold uppercase text-white">
              Apply free.
              <span className="block text-brand-accent">Drive this week.</span>
            </h2>
            <p className="mt-5 max-w-md text-lg text-white/85">
              Fill the form and a specialist personally calls you within 1 hour during business hours.
              No bots. No call centres. No surprises.
            </p>
            <div className="mt-8">
              <ApprovalCardIllustration className="w-full max-w-md" />
            </div>
          </div>
          <div>
            <LeadForm
              variant="hero"
              sourcePage="/"
              heading="Get pre-approved for free"
              subheading="No hard credit check. A specialist personally calls every applicant within 1 hour during business hours."
            />
          </div>
        </div>
      </section>

      {/* ===== Situation directory ===== */}
      <section className="bg-brand-cream">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="grid gap-10 md:grid-cols-[1fr_1.3fr]">
            <div>
              <span className="chip">Pick your page</span>
              <h2 className="display-headline mt-4 text-section font-extrabold uppercase text-brand-ink">
                A page for every situation.
              </h2>
              <p className="mt-4 max-w-sm text-base text-brand-muted">
                We don&apos;t do generic financing. Each page is written by our team with realistic
                timelines, document lists, and Calgary-specific context.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {SITUATION_NAV.map(p => (
                <li key={p.slug}>
                  <Link
                    href={p.slug}
                    className="group block rounded-3xl bg-white p-5 ring-1 ring-brand-line transition hover:-translate-y-1 hover:ring-brand-accent"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-brand-ink">{p.shortTitle}</p>
                        <p className="mt-1 text-sm leading-relaxed text-brand-muted">
                          {p.title}
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-brand-cream text-brand-ink transition group-hover:bg-brand-accent"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== Nissan / vehicles ===== */}
      <section className="bg-brand-creamSoft">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="grid gap-12 md:grid-cols-[1fr_1fr] md:items-center">
            <div className="rounded-4xl bg-brand-deep p-10 text-white md:p-12">
              <span className="chip-dark">The Calgary advantage</span>
              <h2 className="display-headline mt-4 text-section font-extrabold uppercase text-white md:text-[clamp(2rem,4vw,3.25rem)]">
                New <span className="text-brand-accent">2026</span> Nissans,
                <span className="block">through our dealer partners.</span>
              </h2>
              <p className="mt-4 text-base text-white/80">
                Most Calgary brokers can&apos;t get you into a brand-new vehicle. We can. Our
                specialist works directly with dealer partners and brings every program promotion through
                NewWheels first.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/nissan-financing-calgary" className="btn-primary-dark text-sm">
                  Nissan financing Calgary
                </Link>
                <Link href="/calculator" className="btn-ghost-dark text-sm">
                  Estimate my payment
                </Link>
              </div>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {VEHICLES.map(v => (
                <li
                  key={v.name}
                  className="rounded-3xl bg-white p-6 ring-1 ring-brand-line"
                >
                  <p className="text-lg font-bold text-brand-ink">{v.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">{v.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== Brand bio teaser ===== */}
      <section className="bg-brand-cream">
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
          <div className="rounded-4xl bg-white p-8 shadow-card ring-1 ring-brand-line md:p-12">
            <AuthorBio />
          </div>
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
