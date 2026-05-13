import Link from "next/link";
import { BUSINESS, PAGES } from "@/lib/site";
import Logo from "./Logo";
import ApplyFreeButton from "./ApplyFreeButton";

const MENU_LINKS = PAGES.filter(p => p.slug !== "/" && p.slug !== "/privacy");

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-line bg-brand-creamSoft/90 backdrop-blur supports-[backdrop-filter]:bg-brand-creamSoft/75">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:py-4">
        <Link href="/" aria-label="NewWheels home" className="flex shrink-0 items-center">
          <Logo className="h-9 w-auto md:h-10" />
        </Link>

        <nav aria-label="Primary" className="ml-6 hidden flex-1 md:flex">
          <div className="group relative">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-cream"
              aria-haspopup="true"
            >
              Menu <span aria-hidden="true" className="text-[10px]">▼</span>
            </button>
            <ul className="invisible absolute left-0 top-full mt-2 w-72 rounded-3xl border border-brand-line bg-white p-2 opacity-0 shadow-card transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {MENU_LINKS.map(p => (
                <li key={p.slug}>
                  <Link
                    href={p.slug}
                    className="block rounded-2xl px-3 py-2 text-sm font-medium text-brand-ink hover:bg-brand-cream"
                  >
                    {p.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a
            href={`tel:${BUSINESS.phoneHref}`}
            className="hidden text-sm font-semibold text-brand-ink hover:text-brand-forest sm:inline-flex"
            data-analytics="call_click"
          >
            {BUSINESS.phone}
          </a>
          <ApplyFreeButton className="btn-primary px-5 py-2.5 text-sm" />
        </div>
      </div>
    </header>
  );
}
