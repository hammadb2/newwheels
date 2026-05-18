"use client";

import { useState } from "react";
import Link from "next/link";
import type { ApplicantStatusPayload } from "@/lib/crm/leads/apply";
import { QualificationWizard } from "@/components/apply/QualificationWizard";

type Props = {
  token: string;
  status: ApplicantStatusPayload;
  isQualified: boolean;
  siteUrl: string;
};

export function ApplyTokenClient({ token, status, isQualified: initialQualified, siteUrl }: Props) {
  const [qualified, setQualified] = useState(initialQualified);

  // Show qualification wizard if not yet qualified and not already sold/expired
  if (!qualified && status.status !== "sold" && status.status !== "expired") {
    return (
      <QualificationWizard
        token={token}
        firstName={status.first_name}
        onComplete={() => setQualified(true)}
      />
    );
  }

  // Status + documents view (post-qualification)
  const docs = status.documents;
  const visaStatus = status.visa_status;
  const showPermitUpload = visaStatus !== null && visaStatus !== "citizen" && visaStatus !== "permanent_resident";

  const docList: Array<{ key: keyof typeof docs; label: string; show: boolean }> = [
    { key: "drivers_licence_front", label: "Driver's licence (front)", show: true },
    { key: "drivers_licence_back", label: "Driver's licence (back)", show: true },
    { key: "work_permit", label: "Work or study permit", show: showPermitUpload },
    { key: "proof_of_income", label: "Proof of income (pay stub or bank statement)", show: true },
  ];

  const visibleDocs = docList.filter((d) => d.show);
  const docsComplete = visibleDocs.every((d) => docs[d.key]);

  return (
    <main className="min-h-screen bg-brand-creamSoft px-6 py-12 text-brand-ink">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <img src={`${siteUrl}/logo-horizontal.png`} alt="NewWheels" width={140} height={40} className="h-8 w-auto" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-ink">
            Hi {status.first_name},
          </h1>
        </header>

        {/* Qualification complete confirmation */}
        {qualified && status.status === "received" && (
          <section className="rounded-2xl bg-brand-accent/20 p-6 ring-1 ring-brand-accent space-y-2">
            <p className="text-sm font-bold text-brand-forest">Application submitted!</p>
            <p className="text-sm text-brand-ink/80">
              Your answers have been recorded. Upload your documents below to speed up
              your approval — verified applications get priority.
            </p>
          </section>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-brand-line space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-forest">
            {status.status_label}
          </p>
          <p className="text-base leading-relaxed text-brand-ink/80">
            {status.status_blurb}
          </p>
          {status.verified ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-accent px-3 py-1 text-xs font-bold text-brand-ink">
              <span aria-hidden="true">✓</span> Verified application
            </p>
          ) : null}
        </section>

        {status.uploads_open ? (
          <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-brand-line space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-brand-ink">Documents</h2>
              <p className="mt-1 text-sm text-brand-muted">
                Upload these from your phone to speed things up. Verified
                applications get priority and unlock our partner network faster.
              </p>
            </div>
            <ul className="space-y-2 text-sm">
              {visibleDocs.map((d) => (
                <li
                  key={d.key}
                  className="flex items-center justify-between rounded-lg bg-brand-cream px-4 py-3 ring-1 ring-brand-line"
                >
                  <span className="text-brand-ink/90">{d.label}</span>
                  <span
                    className={
                      docs[d.key]
                        ? "rounded-full bg-brand-accent px-2 py-0.5 text-xs font-bold text-brand-ink"
                        : "rounded-full border border-brand-line px-2 py-0.5 text-xs text-brand-muted"
                    }
                  >
                    {docs[d.key] ? "Received" : "Needed"}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href={`/apply/${encodeURIComponent(token)}/documents`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-bold text-brand-ink hover:bg-brand-accentSoft"
            >
              {docsComplete ? "Replace a document" : "Upload documents"}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </section>
        ) : null}

        <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-brand-line space-y-2 text-sm text-brand-ink/80">
          <p className="font-semibold text-brand-ink">Need to reach us?</p>
          <p>
            Call{" "}
            <a className="text-brand-forest font-semibold underline" href="tel:+15879006051">
              (587) 900-6051
            </a>
            {" "}or email{" "}
            <a className="text-brand-forest font-semibold underline" href="mailto:hello@newwheels.ca">
              hello@newwheels.ca
            </a>
          </p>
          <p className="text-xs text-brand-muted">Mon–Sat 9 AM – 7 PM MT</p>
        </section>
      </div>
    </main>
  );
}
