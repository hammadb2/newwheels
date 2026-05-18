// apply.newwheels.ca — landing page when no token is provided.
//
// The applicant portal is token-gated: every applicant receives a unique
// /apply/<token> URL in their confirmation email. Hitting the bare /apply
// path just shows a helpful "use the link in your email" message.

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NewWheels — Application portal",
  description: "Track your NewWheels vehicle financing application.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ApplyIndexPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-creamSoft px-6 py-16 text-brand-ink">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D9FF4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl">
            Check your email
          </h1>
          <p className="text-base leading-relaxed text-brand-muted">
            We sent you a personal link to view your application status and
            upload documents.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-brand-line space-y-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-accent text-xs font-bold text-brand-ink">1</span>
            <p className="text-sm leading-relaxed text-brand-ink/80">
              Open the confirmation email from <strong>NewWheels</strong>.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-accent text-xs font-bold text-brand-ink">2</span>
            <p className="text-sm leading-relaxed text-brand-ink/80">
              Tap the <strong>&ldquo;View my application&rdquo;</strong> button in the email.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-accent text-xs font-bold text-brand-ink">3</span>
            <p className="text-sm leading-relaxed text-brand-ink/80">
              Upload your documents to speed up your approval.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-brand-line text-center space-y-3">
          <p className="text-sm font-semibold text-brand-ink">
            Didn&apos;t get the email?
          </p>
          <p className="text-sm text-brand-muted">
            Check your spam folder, or{" "}
            <Link href="https://newwheels.ca/apply" className="text-brand-forest font-semibold underline">
              re-submit your application
            </Link>
            . We&apos;ll call within 1 hour.
          </p>
        </div>

        <div className="text-center text-sm text-brand-muted">
          <p>
            Need help?{" "}
            <a className="text-brand-forest font-semibold underline" href="tel:+15879006051">(587) 900-6051</a>
            {" · "}
            <a className="text-brand-forest font-semibold underline" href="mailto:hello@newwheels.ca">hello@newwheels.ca</a>
          </p>
          <p className="mt-1 text-xs">Mon–Sat 9 AM – 7 PM MT</p>
        </div>

        <div className="flex justify-center pt-2">
          <img src="https://newwheels.ca/logo-horizontal.png" alt="NewWheels" width={120} height={34} className="h-7 w-auto opacity-40" />
        </div>
      </div>
    </main>
  );
}
