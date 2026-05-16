// apply.newwheels.ca — lightweight applicant status portal.
//
// Real implementation lands in a follow-up PR (token-based status +
// document upload). This stub exists so DNS-pointing-to-Vercel doesn't 404
// and so the proxy rewrite has a real target during the foundation rollout.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NewWheels — Application status",
  description: "Track your NewWheels vehicle financing application.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-[#0E3D24] px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Application portal coming soon</h1>
        <p className="text-base leading-relaxed text-white/85">
          We&apos;re rolling out the new applicant portal in stages. If you&apos;ve already
          applied, a specialist will call you within 1 hour during business hours.
        </p>
        <p className="text-sm text-white/70">
          Need to reach us? Call <a className="text-[#D9FF4E] underline" href="tel:+15879006051">(587) 900-6051</a> or
          email <a className="text-[#D9FF4E] underline" href="mailto:hello@newwheels.ca">hello@newwheels.ca</a>.
        </p>
      </div>
    </main>
  );
}
