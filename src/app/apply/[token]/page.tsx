// apply.newwheels.ca/<token> — applicant status page.
//
// Token-gated. No login. Renders server-side from the lead row keyed by
// apply_token. The status payload is intentionally narrow — first name,
// labelled status, document checklist. No score, no tier, no price.

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getApplicantStatus, isProbablyToken } from "@/lib/crm/leads/apply";

export const metadata: Metadata = {
  title: "Your NewWheels application",
  description: "Track your NewWheels vehicle financing application.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function ApplyTokenPage({ params }: Props) {
  const { token } = await params;
  if (!isProbablyToken(token)) notFound();

  const status = await getApplicantStatus(token);
  if (!status) notFound();

  const docs = status.documents;
  const docList: Array<{ key: keyof typeof docs; label: string }> = [
    { key: "drivers_licence_front", label: "Driver's licence (front)" },
    { key: "drivers_licence_back", label: "Driver's licence (back)" },
    { key: "work_permit", label: "Work or study permit (if applicable)" },
    { key: "proof_of_income", label: "Proof of income (pay stub, NOA, or bank statement)" },
  ];
  const docsComplete = docList.every((d) => docs[d.key]);

  return (
    <main className="min-h-screen bg-[#0E3D24] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-[#D9FF4E]">
            NewWheels application
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Hi {status.first_name},
          </h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#D9FF4E]">
            {status.status_label}
          </p>
          <p className="text-base leading-relaxed text-white/90">
            {status.status_blurb}
          </p>
          {status.verified ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-[#D9FF4E] px-3 py-1 text-xs font-bold text-[#0E3D24]">
              <span aria-hidden="true">✓</span> Verified application
            </p>
          ) : null}
        </section>

        {status.uploads_open ? (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Documents</h2>
              <p className="mt-1 text-sm text-white/75">
                Upload these from your phone to speed things up. Verified
                applications get priority and unlock our partner network
                faster.
              </p>
            </div>
            <ul className="space-y-2 text-sm">
              {docList.map((d) => (
                <li
                  key={d.key}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-4 py-3"
                >
                  <span className="text-white/90">{d.label}</span>
                  <span
                    className={
                      docs[d.key]
                        ? "rounded-full bg-[#D9FF4E] px-2 py-0.5 text-xs font-bold text-[#0E3D24]"
                        : "rounded-full border border-white/30 px-2 py-0.5 text-xs text-white/60"
                    }
                  >
                    {docs[d.key] ? "Received" : "Needed"}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href={`/apply/${encodeURIComponent(token)}/documents`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D9FF4E] px-5 py-3 text-sm font-bold text-[#0E3D24] hover:opacity-90"
            >
              {docsComplete ? "Replace a document" : "Upload documents"}
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        ) : null}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-2 text-sm text-white/80">
          <p className="font-semibold text-white">Need to reach us?</p>
          <p>
            Call{" "}
            <a className="text-[#D9FF4E] underline" href="tel:+15879006051">
              (587) 900-6051
            </a>
            {" "}or email{" "}
            <a className="text-[#D9FF4E] underline" href="mailto:hello@newwheels.ca">
              hello@newwheels.ca
            </a>
            . Business hours: Mon–Sat 9:00 AM – 7:00 PM MT.
          </p>
        </section>

        <p className="pt-4 text-xs leading-relaxed text-white/50">
          Your information is protected under PIPEDA. We only share it with
          dealer and lender partners with your consent. See{" "}
          <Link href="https://newwheels.ca/privacy" className="underline">
            our privacy policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
