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
    <main className="min-h-screen bg-[#0E3D24] px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Use the link in your confirmation email
        </h1>
        <p className="text-base leading-relaxed text-white/85">
          To check your application status or upload documents, open the
          email we sent right after you applied. It contains a personal
          link that takes you to your application.
        </p>
        <p className="text-sm text-white/75">
          Haven&apos;t received it? Check your spam folder, or
          {" "}
          <Link href="https://newwheels.ca/apply" className="text-[#D9FF4E] underline">
            re-submit your application
          </Link>
          {" "}— we&apos;ll call within 1 hour.
        </p>
        <p className="text-sm text-white/70">
          Need help right now? Call <a className="text-[#D9FF4E] underline" href="tel:+15879006051">(587) 900-6051</a>{" "}
          or email <a className="text-[#D9FF4E] underline" href="mailto:hello@newwheels.ca">hello@newwheels.ca</a>.
        </p>
      </div>
    </main>
  );
}
