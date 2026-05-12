import type { ReactNode } from "react";
import Link from "next/link";
import { fullUrl } from "@/lib/site";
import JsonLd from "./JsonLd";
import { breadcrumbSchema, faqSchema, localBusinessSchema } from "@/lib/schema";
import LeadForm from "./LeadForm";
import Faq from "./Faq";
import CtaBlock from "./CtaBlock";
import AuthorBio from "./AuthorBio";
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
      <article className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-neutral-600">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-brand-primary">Home</Link>
            </li>
            {breadcrumb.map(b => (
              <li key={b.path} className="flex items-center gap-1">
                <span aria-hidden="true">›</span>
                <Link href={b.path} className="hover:text-brand-primary">
                  {b.name}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="grid gap-10 md:grid-cols-[1fr_400px]">
          <div className="prose-content">
            {tagline && <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">{tagline}</p>}
            <h1 className="mt-1 text-3xl font-bold leading-tight text-brand-ink md:text-4xl">{title}</h1>
            <p className="mt-3 max-w-prose text-lg text-neutral-800">{intro}</p>
            <div className="prose mt-6 max-w-prose text-neutral-800 [&>h2]:mt-8 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-brand-ink [&>h3]:mt-6 [&>h3]:text-lg [&>h3]:font-semibold [&>p]:mt-3 [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:mt-3 [&>ol]:list-decimal [&>ol]:pl-6 [&_li]:mt-1 [&_strong]:font-semibold">
              {children}
            </div>
            <div className="mt-10 rounded-xl border border-brand-line bg-brand-muted p-5">
              <p className="text-sm font-semibold text-brand-ink">Related pages</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {internalLinks.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-brand-primary underline-offset-4 hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10">
              <AuthorBio />
            </div>
          </div>
          <aside className="md:sticky md:top-24 md:self-start">
            <LeadForm sourcePage={slug} />
          </aside>
        </div>
      </article>
      <Faq items={faq} />
      <CtaBlock heading={ctaHeading} />
    </>
  );
}
