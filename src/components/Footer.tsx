import Link from "next/link";
import { BUSINESS, PAGES, SITE_NAME } from "@/lib/site";
import AuthorBio from "./AuthorBio";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-brand-line">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" aria-label="NewWheels home">
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="mt-2 text-sm text-[#6B7280]">
              Calgary vehicle financing for bad credit, newcomers, work-permit holders, and
              self-employed buyers. Up to 6 months of payments covered on qualified deals.
            </p>
            <p className="mt-4 text-sm text-[#6B7280]">
              <span className="block font-semibold text-[#111111]">{BUSINESS.address.street}</span>
              <span className="block">
                {BUSINESS.address.locality}, {BUSINESS.address.region}{" "}
                {BUSINESS.address.postal}
              </span>
              <span className="block">{BUSINESS.address.country}</span>
            </p>
            <p className="mt-3 text-sm">
              <a
                href={`tel:${BUSINESS.phoneHref}`}
                className="font-semibold text-[#111111]"
                data-analytics="call_click"
              >
                {BUSINESS.phone}
              </a>{" "}
              · <a href={`mailto:${BUSINESS.email}`} className="underline">{BUSINESS.email}</a>
            </p>
            <p className="mt-2 text-sm text-[#6B7280]">{BUSINESS.hours}</p>
            <p className="mt-4 text-xs text-[#9CA3AF]">
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
            <p className="text-sm font-semibold text-[#111111]">Sitemap</p>
            <ul className="mt-3 space-y-2 text-sm">
              {PAGES.filter(p => p.slug !== "/").map(p => (
                <li key={p.slug}>
                  <Link href={p.slug} className="text-[#6B7280] hover:text-[#111111]">
                    {p.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111111]">We serve</p>
            <ul className="mt-3 space-y-2 text-sm text-[#6B7280]">
              {BUSINESS.serviceAreas.map(area => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-brand-line pt-8">
          <AuthorBio compact />
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-brand-line pt-6 text-xs text-[#9CA3AF] md:flex-row md:items-center md:justify-between">
          <span>&copy; {year} {SITE_NAME}. All rights reserved.</span>
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
