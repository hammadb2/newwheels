import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import Faq from "@/components/Faq";
import CtaBlock from "@/components/CtaBlock";
import AuthorBio from "@/components/AuthorBio";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  localBusinessSchema,
} from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { POSTS, findPost } from "@/content/posts.index";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();
  const path = `/blog/${post.slug}`;

  return (
    <>
      <JsonLd
        data={[
          localBusinessSchema(),
          articleSchema({
            headline: post.title,
            description: post.description,
            path,
            datePublished: post.datePublished,
            dateModified: post.dateModified,
          }),
          faqSchema(post.faq),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path },
          ]),
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
                <Link href="/blog" className="hover:text-brand-accent">Blog</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-white/30">/</span>
                <span className="line-clamp-1 text-white/70">{post.title}</span>
              </li>
            </ol>
          </nav>
          <div className="mt-6 max-w-3xl text-white">
            <span className="chip-accent">NewWheels guide</span>
            <h1 className="display-headline mt-4 text-hero font-extrabold uppercase text-white">
              {post.title}
            </h1>
            <p className="mt-5 text-lg text-white/85">{post.description}</p>
            <p className="mt-5 text-xs uppercase tracking-widest text-brand-accent">
              Published {new Date(post.datePublished).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
              {post.dateModified && post.dateModified !== post.datePublished && (
                <> &middot; Updated {new Date(post.dateModified).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</>
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-creamSoft">
        <article className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="grid gap-12 md:grid-cols-[1fr_420px]">
            <div className="prose-content">
              <div className="rounded-4xl bg-white p-7 shadow-card ring-1 ring-brand-line">
                <AuthorBio />
              </div>
              <div className="prose mt-10 max-w-prose text-base leading-relaxed text-brand-ink/85 [&>h2]:display-headline [&>h2]:mt-10 [&>h2]:text-2xl [&>h2]:font-extrabold [&>h2]:uppercase [&>h2]:text-brand-ink [&>h3]:mt-8 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-brand-ink [&>p]:mt-4 [&>ul]:mt-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:mt-4 [&>ol]:list-decimal [&>ol]:pl-6 [&_li]:mt-1.5 [&_li::marker]:text-brand-forest [&_strong]:font-bold [&_a]:text-brand-forest [&_a]:underline-offset-4 [&_a]:underline">
                <post.Body />
              </div>
              <div className="mt-12 rounded-4xl bg-brand-cream p-7 ring-1 ring-brand-line">
                <span className="chip">Related</span>
                <p className="mt-3 text-lg font-bold text-brand-ink">Keep reading</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  <li>
                    <Link
                      href={post.relatedCorePage.href}
                      className="font-semibold text-brand-ink underline-offset-4 hover:text-brand-forest hover:underline"
                    >
                      {post.relatedCorePage.label} →
                    </Link>
                  </li>
                  <li>
                    <Link href="/calculator" className="font-semibold text-brand-ink underline-offset-4 hover:underline">
                      Estimate your payment →
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="font-semibold text-brand-ink underline-offset-4 hover:underline">
                      All NewWheels guides →
                    </Link>
                  </li>
                  <li>
                    <Link href="/how-it-works" className="font-semibold text-brand-ink underline-offset-4 hover:underline">
                      How it works →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <aside className="md:sticky md:top-24 md:self-start" id="apply">
              <LeadForm sourcePage={path} />
            </aside>
          </div>
        </article>
      </section>

      <Faq items={post.faq} />
      <CtaBlock heading="Got questions Hammad didn't answer here?" />
    </>
  );
}
