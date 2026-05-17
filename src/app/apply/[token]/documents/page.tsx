// apply.newwheels.ca/<token>/documents — applicant document upload UI.
//
// Token-gated. Mobile-first. One file picker per doc kind. Uploads stream
// straight to /api/apply/<token>/documents which writes to the private
// applicant-docs Supabase Storage bucket.

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getApplicantStatus, isProbablyToken } from "@/lib/crm/leads/apply";
import { DocumentUploadForm } from "@/components/apply/DocumentUploadForm";

export const metadata: Metadata = {
  title: "Upload documents — NewWheels",
  description: "Securely upload your NewWheels application documents.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function ApplyDocumentsPage({ params }: Props) {
  const { token } = await params;
  if (!isProbablyToken(token)) notFound();

  const status = await getApplicantStatus(token);
  if (!status) notFound();

  if (!status.uploads_open) {
    return (
      <main className="min-h-screen bg-brand-creamSoft px-6 py-12 text-brand-ink">
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-extrabold text-brand-ink">Uploads are closed</h1>
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-brand-line">
            <p className="text-brand-ink/80">
              Your application has moved past the document collection stage.
              If you need to provide additional documents, contact us directly
              at <a className="text-brand-forest font-semibold underline" href="tel:+15879006051">(587) 900-6051</a>
              {" "}or <a className="text-brand-forest font-semibold underline" href="mailto:hello@newwheels.ca">hello@newwheels.ca</a>.
            </p>
          </div>
          <Link
            href={`/apply/${encodeURIComponent(token)}`}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-line px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-cream"
          >
            ← Back to application
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-creamSoft px-6 py-10 text-brand-ink">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href={`/apply/${encodeURIComponent(token)}`}
          className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-ink"
        >
          ← Back to application
        </Link>

        <header className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-forest">
            NewWheels application · documents
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-ink">
            Upload your documents
          </h1>
          <p className="text-sm text-brand-muted">
            Snap a photo or upload a PDF. Files are encrypted in transit
            and stored privately — only your NewWheels specialist and the
            partners you&apos;re matched with can see them.
          </p>
        </header>

        <DocumentUploadForm token={token} initialDocuments={status.documents} />

        <p className="pt-4 text-xs leading-relaxed text-brand-muted">
          Accepted formats: JPG, PNG, HEIC, WebP, PDF. Max 25 MB each.
          Your information is protected under PIPEDA. See{" "}
          <Link href="https://newwheels.ca/privacy" className="text-brand-forest underline">
            our privacy policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
