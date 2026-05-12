import Link from "next/link";
import { BUSINESS, PAGES } from "@/lib/site";
import Logo from "./Logo";

const MENU_LINKS = PAGES.filter(p => p.slug !== "/" && p.slug !== "/privacy");

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:py-4">
        <Link href="/" aria-label="NewWheels home" className="flex shrink-0 items-center gap-2">
          <Logo className="h-7 w-auto" compact />
          <span className="sr-only">NewWheels</span>
        </Link>

        <nav aria-label="Primary" className="ml-4 hidden flex-1 md:flex">
          <div className="group relative">
            <button type="button" className="inline-flex items-center gap-1 rounded-lg px-3 py-2 font-medium text-[#111111] transition hover:text-[#6B7280]" aria-haspopup="true">
              Menu <span aria-hidden="true" className="text-xs">▾</span>
            </button>
            <ul className="invisible absolute left-0 top-full mt-1 w-64 rounded-lg border border-brand-line bg-white p-2 opacity-0 shadow-card transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {MENU_LINKS.map(p => (
                <li key={p.slug}>
                  <Link
                    href={p.slug}
                    className="block rounded-md px-3 py-2 text-sm text-[#111111] hover:bg-[#F9F9F9] hover:text-brand-primary"
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
            className="hidden text-sm font-medium text-[#111111] sm:inline-flex"
            data-analytics="call_click"
          >
            {BUSINESS.phone}
          </a>
          <Link href="/#apply" className="btn-primary text-sm">
            Apply Free
          </Link>
        </div>
      </div>
    </header>
  );
}
