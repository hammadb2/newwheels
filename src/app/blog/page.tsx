import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import CtaBlock from "@/components/CtaBlock";
import AuthorBio from "@/components/AuthorBio";
import { breadcrumbSchema, localBusinessSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { POSTS } from "@/content/posts.index";

const SLUG = "/blog";

export const metadata: Metadata = buildMetadata({
  title: "NewWheels Blog | Calgary Car Loan Guides & Newcomer Tips",
  description:
    "Honest Calgary car-loan guides. Newcomer documentation, post-bankruptcy timelines, work-permit financing, and the 6-months-covered offer explained by Hammad.",
  path: SLUG,
});

export default function BlogHubPage() {
  return (
    <>
      <JsonLd
        data={[
          localBusinessSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: SLUG },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "NewWheels Calgary blog",
            description:
              "Calgary car-loan guides for newcomers, bad-credit buyers, and self-employed Calgarians.",
            blogPost: POSTS.map(p => ({
              "@type": "BlogPosting",
              headline: p.title,
              datePublished: p.datePublished,
              dateModified: p.dateModified || p.datePublished,
              url: `/blog/${p.slug}`,
            })),
          },
        ]}
      />

      <section className="section-deep relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(217,255,78,0.9) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-10 md:pb-16 md:pt-14">
          <nav aria-label="Breadcrumb" className="text-sm text-white/55">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-brand-accent">Home</Link></li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-white/30">/</span>
                <span>Blog</span>
              </li>
            </ol>
          </nav>
          <div className="mt-6 max-w-3xl text-white">
            <span className="chip-accent">NewWheels blog</span>
            <h1 className="display-headline mt-4 text-hero font-extrabold uppercase text-white">
              Calgary car-loan guides,
              <span className="block text-brand-accent">written by Hammad.</span>
            </h1>
            <p className="mt-5 text-lg text-white/85">
              Plain-English guides covering newcomer documentation, post-bankruptcy timelines,
              work-permit financing, the 6-months-covered offer, and Calgary-specific rate
              patterns. Every post is reviewed for accuracy when lender programs or AMVIC rules
              change.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-cream">
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
          <ul className="grid gap-5 md:grid-cols-2">
            {POSTS.map(p => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group block h-full rounded-4xl bg-white p-7 shadow-card ring-1 ring-brand-line transition hover:-translate-y-1 hover:ring-brand-accent"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-forest">
                    {new Date(p.datePublished).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <h2 className="mt-3 text-xl font-extrabold leading-tight text-brand-ink md:text-2xl">
                    {p.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                    {p.description}
                  </p>
                  <p className="mt-4 text-xs font-semibold text-brand-forest">
                    Calgary signal: <span className="text-brand-muted">{p.calgarySignal}</span>
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-ink underline-offset-4 group-hover:underline">
                    Read post <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-14 rounded-4xl bg-white p-7 shadow-card ring-1 ring-brand-line md:p-10">
            <AuthorBio />
          </div>
        </div>
      </section>

      <CtaBlock heading="Done reading? Apply free." />
    </>
  );
}
