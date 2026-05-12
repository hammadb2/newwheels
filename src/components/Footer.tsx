import Link from "next/link";
import { BUSINESS, PAGES, SITE_NAME } from "@/lib/site";
import AuthorBio from "./AuthorBio";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-brand-line bg-brand-muted">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-lg font-bold text-brand-ink">{SITE_NAME}</p>
            <p className="mt-2 text-sm text-neutral-700">
              Calgary vehicle financing for bad credit, newcomers, work-permit holders, and
              self-employed buyers. Up to 6 months of payments covered on qualified deals.
            </p>
            <p className="mt-4 text-sm text-neutral-700">
              <span className="block font-semibold">{BUSINESS.address.street}</span>
              <span className="block">
                {BUSINESS.address.locality}, {BUSINESS.address.region}{" "}
                {BUSINESS.address.postal}
              </span>
              <span className="block">{BUSINESS.address.country}</span>
            </p>
            <p className="mt-3 text-sm">
              <a
                href={`tel:${BUSINESS.phoneHref}`}
                className="font-semibold text-brand-primary"
                data-analytics="call_click"
              >
                {BUSINESS.phone}
              </a>{" "}
              · <a href={`mailto:${BUSINESS.email}`} className="underline">{BUSINESS.email}</a>
            </p>
            <p className="mt-2 text-sm text-neutral-700">{BUSINESS.hours}</p>
            <p className="mt-4 text-xs text-neutral-600">
              AMVIC licensed.{" "}
              <a
                href={BUSINESS.amvicRegistryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {BUSINESS.amvic}
              </a>
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-ink">Sitemap</p>
            <ul className="mt-3 space-y-2 text-sm">
              {PAGES.filter(p => p.slug !== "/").map(p => (
                <li key={p.slug}>
                  <Link href={p.slug} className="text-neutral-700 hover:text-brand-primary">
                    {p.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-ink">We serve</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              {BUSINESS.serviceAreas.map(area => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-brand-line pt-8">
          <AuthorBio compact />
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-brand-line pt-6 text-xs text-neutral-600 md:flex-row md:items-center md:justify-between">
          <span>© {year} {SITE_NAME}. All rights reserved.</span>
          <span>
            <Link href="/privacy" className="underline">Privacy</Link>
            {" · "}
            <Link href="/how-it-works" className="underline">How it works</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
