import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";
import { articleSchema, speakableSchema } from "@/lib/schema";
import { RESOURCE_ARTICLES, findResource } from "@/content/resources/articles";

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return RESOURCE_ARTICLES.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = findResource(slug);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.description,
    path: `/resources/${slug}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = findResource(slug);
  if (!article) notFound();

  const path = `/resources/${article.slug}`;
  const Body = article.Body;

  return (
    <PageShell
      slug={path}
      title={article.title}
      tagline="Resource guide"
      intro={article.summary}
      breadcrumb={[
        { name: "Resources", path: "/resources" },
        { name: article.shortTitle, path },
      ]}
      faq={article.faq}
      internalLinks={[
        article.relatedCorePage,
        { href: "/resources", label: "All Calgary car buying resources" },
        { href: "/calculator", label: "Estimate your Calgary payment" },
        { href: "/how-it-works", label: "How NewWheels works" },
      ]}
      extraSchema={[
        articleSchema({
          headline: article.title,
          description: article.description,
          path,
          datePublished: article.datePublished,
          dateModified: article.dateModified,
        }),
        speakableSchema(["h1", "[data-intro]", "[data-speakable]"]),
      ]}
      ctaHeading="Ready to apply? Free, soft pull, 24-hour decision."
    >
      <Body />
    </PageShell>
  );
}
