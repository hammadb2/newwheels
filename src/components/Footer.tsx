import Link from "next/link";
import { BUSINESS, PAGES, SITE_NAME, FOOTER_NAV_EXTRA } from "@/lib/site";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="section-deep">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" aria-label="NewWheels home" className="inline-flex">
              <Logo className="h-10 w-auto md:h-12" dark />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              {SITE_NAME} is Calgary&apos;s specialist vehicle financing platform. Bad credit,
              newcomers, work permits, and self-employed buyers approved in 24 hours.
            </p>
            <p className="mt-5 text-sm text-white/75">
              <span className="block font-semibold text-white">{BUSINESS.address.street}</span>
              <span className="block">
                {BUSINESS.address.locality}, {BUSINESS.address.region}{" "}
                {BUSINESS.address.postal}
              </span>
              <span className="block">{BUSINESS.address.country}</span>
            </p>
            <p className="mt-4 text-sm">
              <a
                href={`tel:${BUSINESS.phoneHref}`}
                className="font-semibold text-brand-accent underline-offset-4 hover:underline"
                data-analytics="call_click"
              >
                {BUSINESS.phone}
              </a>
              <span className="px-2 text-white/40">·</span>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="text-white underline-offset-4 hover:underline"
              >
                {BUSINESS.email}
              </a>
            </p>
            <p className="mt-2 text-sm text-white/65">{BUSINESS.hours}</p>
            <p className="mt-5 text-xs text-white/50">
              Our specialist is AMVIC licensed.{" "}
              <a
                href={BUSINESS.amvicRegistryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 underline-offset-4 hover:text-brand-accent hover:underline"
              >
                {BUSINESS.amvic}
              </a>
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Sitemap
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {PAGES.filter(p => p.slug !== "/").map(p => (
                <li key={p.slug}>
                  <Link href={p.slug} className="text-white/80 hover:text-brand-accent">
                    {p.shortTitle}
                  </Link>
                </li>
              ))}
              {FOOTER_NAV_EXTRA.filter(p => !PAGES.some(pp => pp.slug === p.slug)).map(p => (
                <li key={p.slug}>
                  <Link href={p.slug} className="text-white/80 hover:text-brand-accent">
                    {p.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              We serve
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {BUSINESS.serviceAreas.map(area => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <span>&copy; {year} {SITE_NAME}. All rights reserved.</span>
          <span>
            <Link href="/privacy" className="underline-offset-4 hover:text-brand-accent hover:underline">
              Privacy
            </Link>
            <span className="px-2 text-white/40">·</span>
            <Link
              href="/how-it-works"
              className="underline-offset-4 hover:text-brand-accent hover:underline"
            >
              How it works
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
