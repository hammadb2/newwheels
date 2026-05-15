// Admin namespace layout. Every page under `/admin/*` is rendered without
// indexing — robots.ts already disallows the path; the metadata here is a
// belt-and-braces signal.

import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_METADATA_ROBOTS } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "NewWheels Admin",
  description: "Internal NewWheels admin panel.",
  robots: ADMIN_METADATA_ROBOTS,
};

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/content", label: "Content pipeline" },
  { href: "/admin/seo", label: "SEO dashboard" },
  { href: "/admin/gbp", label: "Google Business" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-creamSoft text-brand-ink">
      <header className="border-b border-brand-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/admin" className="text-sm font-bold uppercase tracking-widest text-brand-forest">
            NewWheels admin
          </Link>
          <nav>
            <ul className="flex gap-4 text-sm font-semibold">
              {NAV.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-brand-forest">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/" className="text-brand-ink/55 hover:text-brand-forest">
                  ← Site
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
