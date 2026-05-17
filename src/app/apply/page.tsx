// apply.newwheels.ca — landing page when no token is provided.
//
// The applicant portal is token-gated: every applicant receives a unique
// /apply/<token> URL in their confirmation email. Hitting the bare /apply
// path just shows a helpful "use the link in your email" message.

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NewWheels — Application portal",
  description: "Track your NewWheels vehicle financing application.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ApplyIndexPage() {
  return (
    <main className="min-h-screen bg-brand-creamSoft px-6 py-16 text-brand-ink">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-2">
          <Image src="/logo-icon.png" alt="" width={24} height={24} className="h-6 w-auto" />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-forest">
            NewWheels application
          </p>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-ink">
          Use the link in your confirmation email
        </h1>
        <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-brand-line space-y-4">
          <p className="text-base leading-relaxed text-brand-ink/80">
            To check your application status or upload documents, open the
            email we sent right after you applied. It contains a personal
            link that takes you to your application.
          </p>
          <p className="text-sm text-brand-muted">
            Haven&apos;t received it? Check your spam folder, or
            {" "}
            <Link href="https://newwheels.ca/apply" className="text-brand-forest font-semibold underline">
              re-submit your application
            </Link>
            {" "}— we&apos;ll call within 1 hour.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-brand-line">
          <p className="text-sm text-brand-ink/80">
            Need help right now? Call <a className="text-brand-forest font-semibold underline" href="tel:+15879006051">(587) 900-6051</a>{" "}
            or email <a className="text-brand-forest font-semibold underline" href="mailto:hello@newwheels.ca">hello@newwheels.ca</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
