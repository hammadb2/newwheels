// Admin index. Tiny dashboard summarising what's wired and what isn't.

import Link from "next/link";
import {
  adminConfigStatus,
  isAdmin,
  requireAdmin,
} from "@/lib/admin-auth";
import { anthropicConfigStatus } from "@/lib/anthropic";
import { googleAuthStatus } from "@/lib/google/auth";
import { adminRuntime } from "@/lib/admin-paths";
import { RuntimeBanner } from "@/components/admin/RuntimeBanner";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const adminStatus = adminConfigStatus();
  // If `ADMIN_TOKEN` isn't set, fall through to the empty state with setup
  // instructions instead of 404-ing — operators need to see "you haven't set
  // the token yet". With the token set, require it before rendering.
  if (adminStatus.configured) {
    if (!(await isAdmin())) await requireAdmin();
  }

  const anth = anthropicConfigStatus();
  const goog = googleAuthStatus();

  const tiles: Array<{
    href: string;
    label: string;
    description: string;
    status: "ready" | "needs-key" | "needs-creds";
  }> = [
    {
      href: "/admin/content",
      label: "Content pipeline",
      description:
        "Generate resource articles + blog posts via Claude. Drafts ship to repo as JSON.",
      status: anth.configured ? "ready" : "needs-key",
    },
    {
      href: "/admin/seo",
      label: "SEO dashboard",
      description: "Top queries, pages, sessions — pulled from Search Console + GA4.",
      status: goog.configured ? "ready" : "needs-creds",
    },
    {
      href: "/admin/gbp",
      label: "Google Business profile",
      description: "Reviews + Q&A pulled directly from Google Business Profile API.",
      status: goog.configured ? "ready" : "needs-creds",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold uppercase tracking-tight">Admin overview</h1>
      <p className="mt-2 text-sm text-brand-ink/70">
        Internal panel. Robots disallowed. Not linked from any public page.
      </p>

      <div className="mt-6">
        <RuntimeBanner runtime={adminRuntime()} />
      </div>

      {!adminStatus.configured && (
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-bold">Set ADMIN_TOKEN to require auth on this panel.</p>
          <p className="mt-2">
            The panel currently has no token set, so anyone who guesses the URL can reach it.
            Set <code className="rounded bg-amber-100 px-1.5 py-0.5">ADMIN_TOKEN</code> to a
            long random string in your environment, then visit{" "}
            <code className="rounded bg-amber-100 px-1.5 py-0.5">/admin/login?token=…</code> to
            authenticate. Once set, every admin route 404s for unauthenticated requests.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {tiles.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-brand-line transition hover:ring-brand-forest"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-brand-ink/55">
              {t.label}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-brand-ink/80">
              {t.description}
            </p>
            <p className="mt-3 text-xs font-semibold">
              {t.status === "ready" && <span className="text-emerald-700">● Wired</span>}
              {t.status === "needs-key" && (
                <span className="text-amber-700">○ Needs ANTHROPIC_API_KEY</span>
              )}
              {t.status === "needs-creds" && (
                <span className="text-amber-700">○ Needs Google service-account JSON</span>
              )}
            </p>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-base font-extrabold uppercase tracking-wide">Environment expected</h2>
        <ul className="mt-4 space-y-2 text-xs text-brand-ink/75">
          <li>
            <code>ADMIN_TOKEN</code> — long random string. Auth gate for everything under
            <code> /admin/*</code>.
          </li>
          <li>
            <code>ANTHROPIC_API_KEY</code> — Claude access for the content pipeline.
          </li>
          <li>
            <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> — JSON blob (paste inline) for Search
            Console, GA4 Data API, and GBP API.
          </li>
          <li>
            <code>GSC_PROPERTY_URL</code> — e.g. <code>https://newwheels.ca/</code>
          </li>
          <li>
            <code>GA4_PROPERTY_ID</code> — numeric GA4 property ID.
          </li>
          <li>
            <code>GBP_LOCATION_ID</code> — Business Profile location ID (e.g. <code>locations/123456789</code>).
          </li>
        </ul>
      </section>
    </div>
  );
}
