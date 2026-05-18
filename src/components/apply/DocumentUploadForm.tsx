"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type DocKey =
  | "drivers_licence_front"
  | "drivers_licence_back"
  | "work_permit"
  | "proof_of_income";

type Props = {
  token: string;
  initialDocuments: Record<DocKey, boolean>;
  visaStatus?: string | null;
};

type Slot = {
  key: DocKey;
  label: string;
  helper: string;
  acceptsImageOnly?: boolean;
  multiUpload?: boolean;
  maxFiles?: number;
  condition?: (visaStatus: string | null) => boolean;
};

const SLOTS: Slot[] = [
  {
    key: "drivers_licence_front",
    label: "Driver's licence — front",
    helper: "Clear photo of the front side. Make sure your name + photo are readable.",
    acceptsImageOnly: true,
  },
  {
    key: "drivers_licence_back",
    label: "Driver's licence — back",
    helper: "Clear photo of the back side.",
    acceptsImageOnly: true,
  },
  {
    key: "work_permit",
    label: "Work or study permit",
    helper: "Upload a photo or scan of your valid permit.",
    condition: (visa) => visa !== null && visa !== "citizen" && visa !== "permanent_resident",
  },
  {
    key: "proof_of_income",
    label: "Proof of income",
    helper: "Upload 3–4 recent pay stubs, or your latest bank statements. You can upload multiple files.",
    multiUpload: true,
    maxFiles: 4,
  },
];

const ACCEPT_IMAGE = "image/jpeg,image/png,image/heic,image/heif,image/webp";
const ACCEPT_ALL = `${ACCEPT_IMAGE},application/pdf`;

type SlotState = {
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
  fileCount: number;
};

export function DocumentUploadForm({ token, initialDocuments, visaStatus }: Props) {
  const visibleSlots = useMemo(
    () => SLOTS.filter((s) => !s.condition || s.condition(visaStatus ?? null)),
    [visaStatus],
  );

  const [state, setState] = useState<Record<DocKey, SlotState>>(() => ({
    drivers_licence_front: { uploading: false, uploaded: initialDocuments.drivers_licence_front, error: null, fileCount: initialDocuments.drivers_licence_front ? 1 : 0 },
    drivers_licence_back: { uploading: false, uploaded: initialDocuments.drivers_licence_back, error: null, fileCount: initialDocuments.drivers_licence_back ? 1 : 0 },
    work_permit: { uploading: false, uploaded: initialDocuments.work_permit, error: null, fileCount: initialDocuments.work_permit ? 1 : 0 },
    proof_of_income: { uploading: false, uploaded: initialDocuments.proof_of_income, error: null, fileCount: initialDocuments.proof_of_income ? 1 : 0 },
  }));

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      void refreshDocs(token).then((docs) => {
        if (!docs) return;
        setState((prev) => ({
          drivers_licence_front: { ...prev.drivers_licence_front, uploaded: docs.drivers_licence_front || prev.drivers_licence_front.uploaded },
          drivers_licence_back: { ...prev.drivers_licence_back, uploaded: docs.drivers_licence_back || prev.drivers_licence_back.uploaded },
          work_permit: { ...prev.work_permit, uploaded: docs.work_permit || prev.work_permit.uploaded },
          proof_of_income: { ...prev.proof_of_income, uploaded: docs.proof_of_income || prev.proof_of_income.uploaded },
        }));
      });
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [token]);

  const uploadFile = useCallback(
    async (kind: DocKey, file: File) => {
      setState((prev) => ({ ...prev, [kind]: { ...prev[kind], uploading: true, error: null } }));

      const form = new FormData();
      form.append("kind", kind);
      form.append("file", file);

      try {
        const res = await fetch(`/api/apply/${encodeURIComponent(token)}/documents`, {
          method: "POST",
          body: form,
        });
        const payload = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (!res.ok || !payload.ok) {
          setState((prev) => ({
            ...prev,
            [kind]: {
              ...prev[kind],
              uploading: false,
              error: payload.error ? humanError(payload.error) : "Upload failed. Please try again.",
            },
          }));
          return;
        }
        setState((prev) => ({
          ...prev,
          [kind]: { uploading: false, uploaded: true, error: null, fileCount: prev[kind].fileCount + 1 },
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          [kind]: { ...prev[kind], uploading: false, error: "Network error. Please try again." },
        }));
      }
    },
    [token],
  );

  const uploadMultipleFiles = useCallback(
    async (kind: DocKey, files: FileList) => {
      for (let i = 0; i < files.length; i++) {
        await uploadFile(kind, files[i]);
      }
    },
    [uploadFile],
  );

  const completedCount = useMemo(
    () => visibleSlots.filter((s) => state[s.key].uploaded).length,
    [state, visibleSlots],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-brand-cream px-4 py-3 text-sm ring-1 ring-brand-line">
        <span className="font-semibold text-brand-ink">{completedCount} of {visibleSlots.length}</span>
        <span className="text-brand-muted"> documents received</span>
      </div>

      {visibleSlots.map((slot) => {
        const s = state[slot.key];
        const accept = slot.acceptsImageOnly ? ACCEPT_IMAGE : ACCEPT_ALL;
        const inputId = `file-${slot.key}`;
        const isMulti = slot.multiUpload;
        const maxFiles = slot.maxFiles ?? 1;
        const canUploadMore = isMulti ? s.fileCount < maxFiles : !s.uploaded;

        return (
          <div
            key={slot.key}
            className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-brand-line space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-brand-ink text-sm">{slot.label}</p>
                <p className="text-xs text-brand-muted mt-0.5">{slot.helper}</p>
              </div>
              {s.uploaded && (
                <span className="shrink-0 rounded-full bg-brand-accent px-2 py-0.5 text-xs font-bold text-brand-ink">
                  {isMulti && s.fileCount > 1 ? `${s.fileCount} files` : "Received"}
                </span>
              )}
            </div>

            {s.error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{s.error}</p>
            )}

            {canUploadMore && (
              <label
                htmlFor={inputId}
                className={`
                  flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-sm font-semibold transition-colors
                  ${s.uploading ? "border-brand-line bg-brand-cream text-brand-muted" : "border-brand-forest/30 text-brand-forest hover:border-brand-forest hover:bg-brand-cream"}
                `}
              >
                {s.uploading ? (
                  <>
                    <Spinner /> Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon />
                    {s.uploaded && isMulti ? "Add another file" : "Choose file or take photo"}
                  </>
                )}
                <input
                  id={inputId}
                  type="file"
                  accept={accept}
                  multiple={isMulti}
                  className="sr-only"
                  disabled={s.uploading}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    if (isMulti) {
                      void uploadMultipleFiles(slot.key, files);
                    } else {
                      void uploadFile(slot.key, files[0]);
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function humanError(code: string): string {
  switch (code) {
    case "file_too_large": return "File is too large. Maximum size is 25 MB.";
    case "invalid_kind": return "Invalid document type.";
    case "invalid_form": return "Invalid form data. Please try again.";
    case "uploads_closed": return "Uploads are closed for this application.";
    default: return "Something went wrong. Please try again.";
  }
}

async function refreshDocs(token: string): Promise<Record<DocKey, boolean> | null> {
  try {
    const res = await fetch(`/api/apply/${encodeURIComponent(token)}/status`);
    if (!res.ok) return null;
    const json = (await res.json()) as { documents?: Record<DocKey, boolean> };
    return json.documents ?? null;
  } catch {
    return null;
  }
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
