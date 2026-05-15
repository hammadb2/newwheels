import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbSchema,
  localBusinessSchema,
  organizationSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/schema";
import { RESOURCE_ARTICLES } from "@/content/resources/articles";
import HubSpokes from "@/components/HubSpokes";
import { homepageHubSpokes } from "@/lib/hub-spokes";

const SLUG = "/resources";

export const metadata: Metadata = buildMetadata({
  title: "Calgary Car Buying Resources | NewWheels",
  description:
    "Calgary car buying resource hub. New vs used, lease vs buy, building Canadian credit, ownership costs, winter cars, trade-ins, refinancing, and job-loss survival.",
  path: SLUG,
});

const CLUSTER_LABEL: Record<string, string> = {
  "bad-credit": "Bad credit",
  newcomer: "Newcomers",
  "work-permit": "Work permits",
  process: "Car buying process",
  general: "General",
};

export default function ResourcesIndex() {
  const grouped = new Map<string, typeof RESOURCE_ARTICLES>();
  for (const a of RESOURCE_ARTICLES) {
    const arr = grouped.get(a.cluster) ?? [];
    arr.push(a);
    grouped.set(a.cluster, arr);
  }

  return (
    <>
      <JsonLd
        data={[
          localBusinessSchema(),
          organizationSchema(),
          websiteSchema(),
          webPageSchema({
            name: "Calgary Car Buying Resources",
            description:
              "Hand-written articles for Calgary car buyers — research, comparison, ownership, and what to do when things go wrong.",
            path: SLUG,
            about: ["Vehicle financing", "Calgary auto buying", "Newcomer credit", "Used vs new vehicles"],
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: SLUG },
          ]),
        ]}
      />

      <section className="section-deep relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 md:pb-16">
          <span className="chip-accent">Calgary car buying</span>
          <h1
            data-speakable
            className="display-headline mt-4 text-hero font-extrabold uppercase text-white"
          >
            Calgary car buying resource hub
          </h1>
          <p
            data-intro
            data-speakable
            className="mt-5 max-w-2xl text-lg text-white/85"
          >
            Hand-written guides for Calgary buyers. Whether you&apos;re 2 weeks from buying or
            just trying to figure out if leasing or financing is smarter, every article below
            answers a real question with real Calgary numbers.
          </p>
        </div>
      </section>

      <section className="bg-brand-creamSoft">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          {Array.from(grouped.entries()).map(([cluster, articles]) => (
            <div key={cluster} className="mt-12 first:mt-0">
              <h2 className="display-headline text-2xl font-extrabold uppercase text-brand-ink">
                {CLUSTER_LABEL[cluster] ?? cluster}
              </h2>
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {articles.map(a => (
                  <li
                    key={a.slug}
                    className="rounded-4xl bg-white p-6 shadow-card ring-1 ring-brand-line transition hover:ring-brand-forest"
                  >
                    <Link
                      href={`/resources/${a.slug}`}
                      className="group block focus:outline-none"
                    >
                      <h3 className="text-lg font-bold text-brand-ink group-hover:text-brand-forest">
                        {a.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-brand-ink/80">
                        {a.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest">
                        Read the guide
                        <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <HubSpokes
            title="Or jump straight to the page that fits your situation"
            intro="Reading is great. Applying is faster. These hubs route directly to a specialist for your situation."
            groups={[
              { heading: "Situation hubs", spokes: homepageHubSpokes().audiences },
              { heading: "Calgary neighbourhoods", spokes: homepageHubSpokes().locations },
              { heading: "Vehicle hubs", spokes: homepageHubSpokes().vehicles },
              { heading: "Calculators & tools", spokes: homepageHubSpokes().tools },
            ]}
          />
        </div>
      </section>
    </>
  );
}
