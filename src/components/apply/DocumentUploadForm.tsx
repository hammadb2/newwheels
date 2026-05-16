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
};

type Slot = {
  key: DocKey;
  label: string;
  helper: string;
  acceptsImageOnly?: boolean;
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
    helper:
      "Skip if you're a citizen or permanent resident. Otherwise upload a photo of your permit.",
  },
  {
    key: "proof_of_income",
    label: "Proof of income",
    helper:
      "Pay stub, Notice of Assessment, or last bank statement. PDF or photo is fine.",
  },
];

const ACCEPT_IMAGE = "image/jpeg,image/png,image/heic,image/heif,image/webp";
const ACCEPT_ALL = `${ACCEPT_IMAGE},application/pdf`;

type SlotState = {
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
};

export function DocumentUploadForm({ token, initialDocuments }: Props) {
  const [state, setState] = useState<Record<DocKey, SlotState>>(() => ({
    drivers_licence_front: { uploading: false, uploaded: initialDocuments.drivers_licence_front, error: null },
    drivers_licence_back: { uploading: false, uploaded: initialDocuments.drivers_licence_back, error: null },
    work_permit: { uploading: false, uploaded: initialDocuments.work_permit, error: null },
    proof_of_income: { uploading: false, uploaded: initialDocuments.proof_of_income, error: null },
  }));

  // When the page becomes visible again (eg. user comes back from camera),
  // refresh the latest doc state in case an upload completed elsewhere.
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
      setState((prev) => ({ ...prev, [kind]: { uploading: true, uploaded: prev[kind].uploaded, error: null } }));

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
              uploading: false,
              uploaded: prev[kind].uploaded,
              error: payload.error ? humanError(payload.error) : "Upload failed. Please try again.",
            },
          }));
          return;
        }
        setState((prev) => ({ ...prev, [kind]: { uploading: false, uploaded: true, error: null } }));
      } catch {
        setState((prev) => ({
          ...prev,
          [kind]: { uploading: false, uploaded: prev[kind].uploaded, error: "Network error. Please try again." },
        }));
      }
    },
    [token],
  );

  const completedCount = useMemo(
    () => Object.values(state).filter((s) => s.uploaded).length,
    [state],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-black/30 px-4 py-3 text-sm">
        <span className="font-semibold">{completedCount} of {SLOTS.length}</span>
        <span className="text-white/70"> documents received</span>
      </div>

      {SLOTS.map((slot) => {
        const s = state[slot.key];
        const accept = slot.acceptsImageOnly ? ACCEPT_IMAGE : ACCEPT_ALL;
        const inputId = `file-${slot.key}`;
        return (
          <div
            key={slot.key}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold">{slot.label}</h3>
                <p className="mt-1 text-xs text-white/65">{slot.helper}</p>
              </div>
              <Badge state={s} />
            </div>
            <div>
              <label
                htmlFor={inputId}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  s.uploading
                    ? "bg-white/20 text-white/60"
                    : s.uploaded
                    ? "border border-[#D9FF4E] bg-transparent text-[#D9FF4E] hover:bg-[#D9FF4E]/10"
                    : "bg-[#D9FF4E] text-[#0E3D24] hover:opacity-90"
                }`}
                aria-disabled={s.uploading || undefined}
              >
                {s.uploading
                  ? "Uploading…"
                  : s.uploaded
                  ? "Replace file"
                  : "Choose file or take photo"}
              </label>
              <input
                id={inputId}
                type="file"
                accept={accept}
                capture={slot.acceptsImageOnly ? "environment" : undefined}
                className="sr-only"
                disabled={s.uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void uploadFile(slot.key, file);
                  e.target.value = "";
                }}
              />
            </div>
            {s.error ? (
              <p className="text-xs text-red-200" role="alert">
                {s.error}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Badge({ state }: { state: SlotState }) {
  if (state.uploading) {
    return (
      <span className="shrink-0 rounded-full border border-white/30 px-2 py-0.5 text-xs text-white/70">
        Uploading…
      </span>
    );
  }
  if (state.uploaded) {
    return (
      <span className="shrink-0 rounded-full bg-[#D9FF4E] px-2 py-0.5 text-xs font-bold text-[#0E3D24]">
        Received
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full border border-white/30 px-2 py-0.5 text-xs text-white/65">
      Needed
    </span>
  );
}

function humanError(code: string): string {
  if (code === "file_too_large") return "That file is larger than 25 MB. Please try a smaller one.";
  if (code === "unsupported_mime") return "We accept JPG, PNG, HEIC, WebP, and PDF.";
  if (code === "empty_file") return "Hmm, that file looks empty. Try again.";
  if (code === "invalid_kind") return "Unknown document type.";
  if (code === "not_found") return "We couldn't find your application. Try the link in your email again.";
  if (code.startsWith("storage:")) return "Storage error — please try again in a moment.";
  return "Upload failed. Please try again.";
}

async function refreshDocs(token: string): Promise<Record<DocKey, boolean> | null> {
  try {
    const res = await fetch(`/api/apply/${encodeURIComponent(token)}/status`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as {
      documents?: Record<DocKey, boolean>;
    };
    return payload.documents ?? null;
  } catch {
    return null;
  }
}
