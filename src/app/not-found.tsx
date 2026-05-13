import Link from "next/link";
import { PAGES } from "@/lib/site";

export default function NotFound() {
  const links = PAGES.filter(p => p.slug !== "/").slice(0, 8);
  return (
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
      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center text-white md:py-28">
        <span className="chip-accent">404</span>
        <h1 className="display-headline mt-4 text-hero font-extrabold uppercase text-white">
          Page not <span className="text-brand-accent">found.</span>
        </h1>
        <p className="mt-5 text-lg text-white/85">
          It may have been moved or renamed. Try one of these instead:
        </p>
        <ul className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-2">
          {links.map(p => (
            <li key={p.slug}>
              <Link
                href={p.slug}
                className="block rounded-3xl bg-brand-forest/40 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-brand-accent hover:text-brand-ink"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Link href="/" className="btn-primary-dark">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
