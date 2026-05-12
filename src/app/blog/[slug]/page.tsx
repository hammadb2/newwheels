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
      <article className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-[#9CA3AF]">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="hover:text-[#111111]">Home</Link></li>
            <li className="flex items-center gap-1"><span aria-hidden="true">&rsaquo;</span> <Link href="/blog" className="hover:text-[#111111]">Blog</Link></li>
            <li className="flex items-center gap-1"><span aria-hidden="true">&rsaquo;</span> <span>{post.title}</span></li>
          </ol>
        </nav>

        <div className="grid gap-10 md:grid-cols-[1fr_400px]">
          <div className="prose-content">
            <AuthorBio />
            <p className="mt-3 text-xs text-[#9CA3AF]">
              Published {new Date(post.datePublished).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
              {post.dateModified && post.dateModified !== post.datePublished && (
                <> &middot; Updated {new Date(post.dateModified).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</>
              )}
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 text-lg text-[#6B7280]">{post.description}</p>
            <div className="prose mt-6 max-w-prose text-[#6B7280] [&>h2]:mt-8 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-[#111111] [&>h3]:mt-6 [&>h3]:text-lg [&>h3]:font-semibold [&>p]:mt-3 [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:mt-3 [&>ol]:list-decimal [&>ol]:pl-6 [&_li]:mt-1 [&_strong]:font-semibold">
              <post.Body />
            </div>
            <div className="mt-10 rounded-xl border border-brand-line bg-[#F9F9F9] p-5">
              <p className="text-sm font-semibold text-[#111111]">Related</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                <li>
                  <Link href={post.relatedCorePage.href} className="text-[#111111] underline-offset-4 hover:underline">
                    {post.relatedCorePage.label}
                  </Link>
                </li>
                <li><Link href="/calculator" className="text-[#111111] underline-offset-4 hover:underline">Estimate your payment</Link></li>
                <li><Link href="/blog" className="text-[#111111] underline-offset-4 hover:underline">All NewWheels guides</Link></li>
                <li><Link href="/how-it-works" className="text-[#111111] underline-offset-4 hover:underline">How it works</Link></li>
              </ul>
            </div>
          </div>
          <aside className="md:sticky md:top-24 md:self-start">
            <LeadForm sourcePage={path} />
          </aside>
        </div>
      </article>
      <Faq items={post.faq} />
      <CtaBlock heading="Got questions Hammad didn't answer here?" />
    </>
  );
}
