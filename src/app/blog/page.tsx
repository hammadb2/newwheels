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
      <article className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-[#9CA3AF]">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="hover:text-[#111111]">Home</Link></li>
            <li className="flex items-center gap-1"><span aria-hidden="true">&rsaquo;</span> <span>Blog</span></li>
          </ol>
        </nav>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">NewWheels blog</p>
        <h1 className="mt-1 text-3xl font-bold leading-tight md:text-4xl">
          Calgary car-loan guides, written by Hammad, not a content mill.
        </h1>
        <p className="mt-3 max-w-prose text-lg text-[#6B7280]">
          Plain-English guides covering newcomer documentation, post-bankruptcy timelines,
          work-permit financing, the 6-months-covered offer, and Calgary-specific rate
          patterns. Every post is reviewed for accuracy when lender programs or AMVIC rules
          change.
        </p>

        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {POSTS.map(p => (
            <li key={p.slug} className="rounded-2xl border border-brand-line bg-white p-5 transition hover:border-[#111111]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                {new Date(p.datePublished).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
              </p>
              <h2 className="mt-1 text-xl font-bold">
                <Link href={`/blog/${p.slug}`} className="hover:text-[#6B7280]">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-[#6B7280]">{p.description}</p>
              <p className="mt-3 text-xs text-[#9CA3AF]">Calgary signal: {p.calgarySignal}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <AuthorBio />
        </div>
      </article>
      <CtaBlock heading="Done reading? Apply free." />
    </>
  );
}
