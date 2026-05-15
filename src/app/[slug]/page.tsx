// Programmatic catchall route. Every page object emitted by
// `getAllProgrammaticPages()` is statically generated here at build time via
// `generateStaticParams`, with metadata + schema computed per-slug. Anything
// in `RESERVED_SLUGS` is skipped so we never shadow a hand-built static page.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";
import {
  loanOrCreditSchema,
  serviceSchema,
  speakableSchema,
} from "@/lib/schema";
import {
  getAllProgrammaticPages,
  getProgrammaticPage,
} from "@/lib/programmatic/pages";
import type { ProgrammaticPage } from "@/lib/programmatic/types";
import { linkifyText } from "@/lib/internal-links";

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return getAllProgrammaticPages().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getProgrammaticPage(slug);
  if (!page) return {};
  return buildMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/${slug}`,
  });
}

function buildExtraSchema(page: ProgrammaticPage): object[] {
  const path = `/${page.slug}`;
  const extras: object[] = [];

  // Every programmatic page is a financing surface — emit Service + LoanOrCredit.
  extras.push(
    serviceSchema({
      name: page.metaTitle,
      description: page.metaDescription,
      path,
      serviceType: "Vehicle financing",
    }),
  );

  extras.push(
    loanOrCreditSchema({
      name: page.metaTitle,
      description: page.metaDescription,
      path,
      loanType: "Auto loan",
      minLoan: 5000,
      maxLoan: 120000,
      rateLow: 5.99,
      rateHigh: 24.99,
      loanTermMonthsLow: 36,
      loanTermMonthsHigh: 84,
    }),
  );

  // Voice-search-friendly speakable spec. Targets the page intro + H1.
  extras.push(
    speakableSchema(
      page.speakableSelectors && page.speakableSelectors.length > 0
        ? page.speakableSelectors
        : ["h1", "[data-intro]", "[data-speakable]"],
    ),
  );

  // Per-page extras (e.g. Vehicle schema on make/model pages) come in last
  // so they override anything above if the generator chose to be specific.
  if (page.extraSchema && page.extraSchema.length > 0) {
    extras.push(...page.extraSchema);
  }

  return extras;
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getProgrammaticPage(slug);
  if (!page) notFound();

  return (
    <PageShell
      slug={`/${page.slug}`}
      title={page.h1}
      tagline={page.tagline}
      intro={page.intro}
      breadcrumb={[
        { name: page.category, path: `/${page.slug}` },
      ]}
      faq={page.faq}
      internalLinks={page.related.map(r => ({ href: r.href, label: r.label }))}
      extraSchema={buildExtraSchema(page)}
      ctaHeading={page.ctaHeading}
    >
      {page.sections.map((section, idx) => (
        <section key={`${page.slug}-section-${idx}`} className="mt-12 first:mt-0">
          <h2>{section.heading}</h2>
          {section.paragraphs.map((para, pi) => (
            <p key={`${page.slug}-p-${idx}-${pi}`}>
              {linkifyText(para, { selfHref: `/${page.slug}` })}
            </p>
          ))}
          {section.bullets && section.bullets.length > 0 && (
            <ul>
              {section.bullets.map((b, bi) => (
                <li key={`${page.slug}-b-${idx}-${bi}`}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </PageShell>
  );
}
