import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { BUSINESS } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, localBusinessSchema, teamSchema } from "@/lib/schema";
import LeadForm from "@/components/LeadForm";
import CtaBlock from "@/components/CtaBlock";

const SLUG = "/team";

export const metadata: Metadata = buildMetadata({
  title: "The NewWheels Team | Calgary Vehicle Financing Specialists",
  description:
    "Meet the NewWheels team. AMVIC-licensed Calgary automotive finance specialists who handle every application personally. Newcomer, bad credit, and subprime experts.",
  path: SLUG,
});

export default function TeamPage() {
  return (
    <>
      <JsonLd
        data={[
          localBusinessSchema(),
          teamSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Team", path: SLUG },
          ]),
        ]}
      />

      <section className="section-deep relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(217,255,78,0.9) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-10 md:pb-16 md:pt-14">
          <nav aria-label="Breadcrumb" className="text-sm text-white/55">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-brand-accent">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-white/30">
                  /
                </span>
                <span>Team</span>
              </li>
            </ol>
          </nav>
          <div className="mt-8 max-w-3xl text-white">
            <span className="chip-accent">Our team</span>
            <h1 className="display-headline mt-4 text-hero font-extrabold uppercase text-white">
              The NewWheels Team
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">
              Real people who know Calgary. Every application is reviewed personally and every
              applicant gets a phone call within 1 hour.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-creamSoft">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
          <div className="grid gap-12 md:grid-cols-[1fr_420px]">
            <div>
              <div className="rounded-4xl bg-white p-8 shadow-card ring-1 ring-brand-line">
                <span className="chip">Calgary Finance Specialist</span>
                <h2 className="mt-4 text-2xl font-extrabold text-brand-ink">
                  Calgary Finance Specialist
                </h2>
                <p className="mt-1 text-sm font-semibold text-brand-forest">
                  AMVIC Licensed
                </p>
                <p className="mt-4 text-base leading-relaxed text-brand-muted">
                  Specializes in newcomer, bad credit, and subprime financing across Calgary
                  and area. Years of experience on the dealer floor and in alternative-prime
                  lending. Handles every NewWheels application personally.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-brand-muted">
                  <li>
                    <strong className="text-brand-ink">Expertise:</strong> Newcomer car loans
                    (PGWP, LMIA, TFW), bad credit &amp; bankruptcy rebuilds, consumer
                    proposals, self-employed &amp; contractor financing
                  </li>
                  <li>
                    <strong className="text-brand-ink">Licence:</strong>{" "}
                    <a
                      href={BUSINESS.amvicRegistryUrl}
                      className="text-brand-forest underline underline-offset-4"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {BUSINESS.amvic} &mdash; verify on AMVIC registry
                    </a>
                  </li>
                  <li>
                    <strong className="text-brand-ink">Location:</strong> Calgary, Alberta
                  </li>
                  <li>
                    <strong className="text-brand-ink">Response time:</strong> Within 1 hour
                    during business hours
                  </li>
                </ul>
              </div>

              <div className="mt-10 rounded-4xl bg-brand-cream p-7 ring-1 ring-brand-line">
                <span className="chip">Related</span>
                <p className="mt-3 text-lg font-bold text-brand-ink">
                  Learn more about NewWheels
                </p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  <li>
                    <Link
                      href="/about"
                      className="font-semibold text-brand-ink underline-offset-4 hover:text-brand-forest hover:underline"
                    >
                      About NewWheels &rarr;
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/how-it-works"
                      className="font-semibold text-brand-ink underline-offset-4 hover:text-brand-forest hover:underline"
                    >
                      How it works &rarr;
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="font-semibold text-brand-ink underline-offset-4 hover:text-brand-forest hover:underline"
                    >
                      Read our guides &rarr;
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/calculator"
                      className="font-semibold text-brand-ink underline-offset-4 hover:text-brand-forest hover:underline"
                    >
                      Payment calculator &rarr;
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <aside className="md:sticky md:top-24 md:self-start" id="apply">
              <LeadForm sourcePage={SLUG} />
            </aside>
          </div>
        </div>
      </section>

      <CtaBlock heading="Want to talk to our team? Apply free." />
    </>
  );
}
