import type { ReactNode } from "react";
import Link from "next/link";
import { fullUrl } from "@/lib/site";
import JsonLd from "./JsonLd";
import { breadcrumbSchema, faqSchema, localBusinessSchema } from "@/lib/schema";
import LeadForm from "./LeadForm";
import Faq from "./Faq";
import CtaBlock from "./CtaBlock";
import AuthorBio from "./AuthorBio";
import { SituationIllustration } from "./Illustrations";
import type { FaqItem } from "@/lib/schema";

type Props = {
  slug: string;
  title: string;
  intro: string;
  breadcrumb: { name: string; path: string }[];
  faq: FaqItem[];
  children: ReactNode;
  internalLinks: { href: string; label: string }[];
  extraSchema?: object[];
  tagline?: string;
  ctaHeading?: string;
};

export default function PageShell({
  slug,
  title,
  intro,
  breadcrumb,
  faq,
  children,
  internalLinks,
  extraSchema = [],
  tagline,
  ctaHeading,
}: Props) {
  const baseSchema = [
    localBusinessSchema(),
    faqSchema(faq),
    breadcrumbSchema([{ name: "Home", path: "/" }, ...breadcrumb]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      url: fullUrl(slug),
      description: intro,
      inLanguage: "en-CA",
    },
  ];

  return (
    <>
      <JsonLd data={[...baseSchema, ...extraSchema]} />

      {/* ===== Hero section ===== */}
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
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 md:pb-16 md:pt-14">
          <nav aria-label="Breadcrumb" className="text-sm text-white/55">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-brand-accent">
                  Home
                </Link>
              </li>
              {breadcrumb.map(b => (
                <li key={b.path} className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="text-white/30">/</span>
                  <Link href={b.path} className="hover:text-brand-accent">
                    {b.name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div className="text-white">
              {tagline && (
                <span className="chip-accent">{tagline}</span>
              )}
              <h1 className="display-headline mt-4 text-hero font-extrabold uppercase text-white">
                {title}
              </h1>
              <p
                data-intro
                data-speakable
                className="mt-5 max-w-xl text-lg text-white/85"
              >
                {intro}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="#apply" className="btn-primary-dark text-sm">
                  Apply free
                </Link>
                <Link href="/calculator" className="btn-ghost-dark text-sm">
                  Run the calculator
                </Link>
              </div>
            </div>
            <div className="md:justify-self-end md:max-w-md w-full">
              <SituationIllustration slug={slug} className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Body content + lead form ===== */}
      <section className="bg-brand-creamSoft">
        <article className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="grid gap-12 md:grid-cols-[1fr_420px]">
            <div className="prose-content">
              <div className="prose max-w-prose text-base leading-relaxed text-brand-ink/85 [&>h2]:display-headline [&>h2]:mt-10 [&>h2]:text-2xl [&>h2]:font-extrabold [&>h2]:uppercase [&>h2]:tracking-tight [&>h2]:text-brand-ink [&>h2]:first:mt-0 [&>h3]:mt-8 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-brand-ink [&>p]:mt-4 [&>ul]:mt-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:mt-4 [&>ol]:list-decimal [&>ol]:pl-6 [&_li]:mt-1.5 [&_li::marker]:text-brand-forest [&_strong]:font-bold [&_a]:text-brand-forest [&_a]:underline-offset-4 [&_a]:underline">
                {children}
              </div>

              <div className="mt-12 rounded-4xl bg-brand-cream p-7 ring-1 ring-brand-line">
                <span className="chip">Related</span>
                <p className="mt-3 text-lg font-bold text-brand-ink">
                  Other Calgary financing pages
                </p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {internalLinks.map(l => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-ink underline-offset-4 hover:text-brand-forest hover:underline"
                      >
                        {l.label}
                        <span aria-hidden="true" className="transition group-hover:translate-x-0.5">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-12 rounded-4xl bg-white p-7 shadow-card ring-1 ring-brand-line">
                <AuthorBio />
              </div>
            </div>

            <aside className="md:sticky md:top-24 md:self-start" id="apply">
              <LeadForm sourcePage={slug} />
            </aside>
          </div>
        </article>
      </section>

      <Faq items={faq} />
      <CtaBlock heading={ctaHeading} />
    </>
  );
}
