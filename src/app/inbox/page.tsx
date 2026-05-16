// team.newwheels.ca → /inbox — internal team email inbox.
//
// We route team.newwheels.ca to /inbox (not /team) because /team is already
// the public "Meet the team" marketing page on the apex. The full email
// inbox UI (Resend MX + inbound webhook + threaded view) lands in a later
// PR — this stub exists so DNS-pointing-to-Vercel doesn't 404.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NewWheels — Team inbox",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function TeamInboxPage() {
  return (
    <main className="min-h-screen bg-[#0E3D24] px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Team inbox</h1>
        <p className="text-base leading-relaxed text-white/85">
          This subdomain hosts the internal team email inbox. Sign in to the{" "}
          <a className="text-[#D9FF4E] underline" href="https://crm.newwheels.ca">CRM</a> to read your inbox.
        </p>
        <p className="text-sm text-white/70">
          Email addresses ending in <code className="rounded bg-white/10 px-1.5 py-0.5">@team.newwheels.ca</code> are routed
          through Resend and stored in Supabase. The full inbox UI lands in a follow-up release.
        </p>
      </div>
    </main>
  );
}
