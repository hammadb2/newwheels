// Helpers for storing and serving private files in Supabase Storage.
//
// We use a single private bucket called `verification-docs`. Bucket setup is
// not done in the SQL migration because Supabase Storage uses its own
// metadata tables; the bucket should be created manually (or via a
// follow-up migration that uses Supabase's storage admin endpoints).

import { getServerSupabase } from "./supabase/server";

export const VERIFICATION_DOCS_BUCKET = "verification-docs";
export const EMAIL_ATTACHMENTS_BUCKET = "email-attachments";

const MAX_VERIFICATION_DOC_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "application/pdf",
]);

export type UploadedVerificationDoc = {
  storage_path: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
};

/**
 * Upload a single verification file. Returns the storage path on success.
 * Throws on validation errors so the API surface is uniform.
 */
export async function uploadVerificationDoc(opts: {
  buyer_id: string;
  doc_kind: "amvic_licence" | "gov_id" | "business_doc" | "other";
  file: File;
}): Promise<UploadedVerificationDoc> {
  if (opts.file.size > MAX_VERIFICATION_DOC_BYTES) {
    throw new Error("file_too_large");
  }
  if (!ALLOWED_MIME.has(opts.file.type)) {
    throw new Error("unsupported_mime");
  }
  const supabase = getServerSupabase();
  if (!supabase) throw new Error("not_configured");

  const ext = guessExt(opts.file.name, opts.file.type);
  const path = `${opts.buyer_id}/${opts.doc_kind}-${Date.now()}${ext}`;
  const buf = Buffer.from(await opts.file.arrayBuffer());

  const { error } = await supabase.storage
    .from(VERIFICATION_DOCS_BUCKET)
    .upload(path, buf, {
      contentType: opts.file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) {
    console.error("uploadVerificationDoc failed", error);
    throw new Error("storage_error");
  }

  return {
    storage_path: path,
    original_filename: opts.file.name.slice(0, 200),
    mime_type: opts.file.type || "application/octet-stream",
    size_bytes: opts.file.size,
  };
}

/** Sign a private storage object so the CEO can review it. */
export async function signedVerificationDocUrl(storage_path: string, ttlSec = 600): Promise<string | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.storage
    .from(VERIFICATION_DOCS_BUCKET)
    .createSignedUrl(storage_path, ttlSec);
  if (error) return null;
  return data?.signedUrl ?? null;
}

function guessExt(filename: string, mime: string): string {
  const i = filename.lastIndexOf(".");
  if (i > -1) return filename.slice(i).toLowerCase().slice(0, 8);
  switch (mime) {
    case "image/png": return ".png";
    case "image/jpeg": return ".jpg";
    case "image/webp": return ".webp";
    case "image/heic": return ".heic";
    case "application/pdf": return ".pdf";
    default: return "";
  }
}
