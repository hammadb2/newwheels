import Link from "next/link";
import { PAGES } from "@/lib/site";

export default function NotFound() {
  const links = PAGES.filter(p => p.slug !== "/").slice(0, 8);
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold text-brand-ink md:text-4xl">
        We couldn&apos;t find that page.
      </h1>
      <p className="mt-3 text-neutral-700">
        It may have been moved or renamed. Try one of these:
      </p>
      <ul className="mx-auto mt-6 grid max-w-xl gap-2 text-left sm:grid-cols-2">
        {links.map(p => (
          <li key={p.slug}>
            <Link href={p.slug} className="text-brand-primary underline-offset-4 hover:underline">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link href="/" className="btn-primary">Back to home</Link>
      </div>
    </section>
  );
}
