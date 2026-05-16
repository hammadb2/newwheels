// docs.newwheels.ca — API + integration docs landing.
//
// Full content lands when the Open API is exposed (phase 2). This stub
// exists so DNS-pointing-to-Vercel doesn't 404.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NewWheels — Docs",
  description: "Developer docs for the NewWheels lead API.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#0E3D24] px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Docs are on the way</h1>
        <p className="text-base leading-relaxed text-white/85">
          The NewWheels Open API is part of phase 2. Master dealer accounts will be
          invited to receive leads directly into their DMS via REST + webhook delivery.
        </p>
        <p className="text-sm text-white/70">
          Questions about integration? Email <a className="text-[#D9FF4E] underline" href="mailto:hello@newwheels.ca">hello@newwheels.ca</a>.
        </p>
      </div>
    </main>
  );
}
