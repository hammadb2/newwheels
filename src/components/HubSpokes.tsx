// Hub-and-spoke link block. Drops inline on a hub page (e.g. `/bad-credit-…`)
// and surfaces the most relevant spoke pages for that hub: cross-product
// audience-by-location pages, audience-by-make pages, neighbourhood pages,
// surrounding cities, etc.
//
// Why this matters: Phase 1 generates hundreds of programmatic spokes, but
// without inline hub-to-spoke links Google has to discover them through the
// sitemap alone. Inline cross-linking from the hub multiplies crawl
// efficiency and concentrates topical authority on the hub.

import Link from "next/link";

export type HubSpoke = { href: string; label: string };

export type HubSpokeGroup = {
  heading: string;
  // Short helper text under the heading.
  blurb?: string;
  spokes: HubSpoke[];
};

export default function HubSpokes({
  title,
  intro,
  groups,
}: {
  title: string;
  intro?: string;
  groups: HubSpokeGroup[];
}) {
  return (
    <aside className="mt-12 rounded-4xl bg-brand-cream p-7 ring-1 ring-brand-line">
      <span className="chip">Explore</span>
      <p className="mt-3 text-lg font-bold text-brand-ink">{title}</p>
      {intro && <p className="mt-2 text-sm text-brand-ink/70">{intro}</p>}
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        {groups.map((g, gi) => (
          <div key={gi}>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-ink/70">
              {g.heading}
            </p>
            {g.blurb && (
              <p className="mt-1 text-xs text-brand-ink/55">{g.blurb}</p>
            )}
            <ul className="mt-3 grid gap-1.5">
              {g.spokes.map(s => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="block rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-brand-ink ring-1 ring-brand-line transition hover:bg-brand-creamSoft hover:text-brand-forest"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
