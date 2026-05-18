// Helpers for the applicant-facing portal at apply.newwheels.ca/<token>.
//
// The applicant never logs in. Authentication is purely "do you have the
// token from your confirmation email?". The server always uses the
// service-role client; we never expose anon Supabase reads to the
// applicant-side because RLS doesn't have a notion of "anon with a token".

import type { SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/crm/supabase/server";

const APPLY_PORTAL_HOST =
  process.env.NW_APPLY_URL ||
  process.env.NW_APPLY_HOST ||
  "https://apply.newwheels.ca";

/** Build the public applicant-portal URL for a given token. */
export function applyPortalUrl(token: string, path = ""): string {
  const base = APPLY_PORTAL_HOST.startsWith("http")
    ? APPLY_PORTAL_HOST
    : `https://${APPLY_PORTAL_HOST}`;
  const trimmed = base.replace(/\/$/, "");
  const suffix = path && !path.startsWith("/") ? `/${path}` : path;
  return `${trimmed}/${encodeURIComponent(token)}${suffix}`;
}

/** Loose UUID regex — does NOT validate version, but cheaply rejects garbage. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isProbablyToken(value: string | undefined | null): boolean {
  return !!value && UUID_RE.test(value);
}

// -----------------------------------------------------------------
// Public status payload — narrow projection of nw.leads that the
// applicant is allowed to see. No score, no tier, no buyer details,
// no contact info beyond what the applicant already submitted.
// -----------------------------------------------------------------

/** What state the applicant should see (decoupled from the internal status enum). */
export type ApplicantStatus =
  | "received"            // status='new' or 'qualifying' and no Retell yet
  | "qualification_in_progress"  // Retell call started
  | "qualification_complete"     // assessed; either marketplace or specialist follow-up
  | "matching"            // available in marketplace
  | "sold"                // a dealer purchased the lead
  | "specialist_follow_up"  // qualification flagged for manual review
  | "expired"             // 72hr no-purchase
  | "unknown";

export type ApplicantStatusPayload = {
  lead_id: string;
  status: ApplicantStatus;
  status_label: string;
  status_blurb: string;
  first_name: string;
  visa_status: string | null;
  documents: {
    drivers_licence_front: boolean;
    drivers_licence_back: boolean;
    work_permit: boolean;
    proof_of_income: boolean;
  };
  verified: boolean;
  /** Whether the upload form is still open for new documents. */
  uploads_open: boolean;
};

/** Resolve a token to the most recent matching lead — null if not found. */
export async function findLeadByApplyToken(
  token: string,
): Promise<{
  id: string;
  first_name: string;
  status: string;
  verified: boolean;
  retell_call_status: string | null;
  expired_at: string | null;
} | null> {
  if (!isProbablyToken(token)) return null;
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("leads")
    .select("id, first_name, status, verified, retell_call_status, expired_at")
    .eq("apply_token", token)
    .maybeSingle();
  if (error || !data) return null;
  return data as {
    id: string;
    first_name: string;
    status: string;
    verified: boolean;
    retell_call_status: string | null;
    expired_at: string | null;
  };
}

/** Aggregate the applicant-facing status payload. */
export async function getApplicantStatus(
  token: string,
): Promise<ApplicantStatusPayload | null> {
  const lead = await findLeadByApplyToken(token);
  if (!lead) return null;

  const supabase = getServerSupabase();
  const docs = await listDocumentKinds(supabase, lead.id);

  const status = mapInternalStatusToApplicant(lead);
  const labels = APPLICANT_STATUS_LABELS[status];

  // Fetch visa_status from qualifications if available
  let visaStatus: string | null = null;
  if (supabase) {
    const { data: qual } = await supabase
      .from("lead_qualifications")
      .select("visa_status")
      .eq("lead_id", lead.id)
      .maybeSingle();
    visaStatus = (qual?.visa_status as string) ?? null;
  }

  return {
    lead_id: lead.id,
    status,
    status_label: labels.label,
    status_blurb: labels.blurb,
    first_name: lead.first_name ?? "there",
    visa_status: visaStatus,
    documents: {
      drivers_licence_front: docs.has("drivers_licence_front"),
      drivers_licence_back: docs.has("drivers_licence_back"),
      work_permit: docs.has("work_permit") || docs.has("study_permit"),
      proof_of_income: docs.has("proof_of_income") || docs.has("bank_statement"),
    },
    verified: lead.verified,
    uploads_open: status !== "sold" && status !== "expired",
  };
}

async function listDocumentKinds(
  supabase: SupabaseClient | null,
  leadId: string,
): Promise<Set<string>> {
  if (!supabase) return new Set();
  const { data } = await supabase
    .from("lead_documents")
    .select("kind")
    .eq("lead_id", leadId);
  return new Set((data ?? []).map((r) => r.kind as string));
}

function mapInternalStatusToApplicant(lead: {
  status: string;
  retell_call_status: string | null;
  expired_at: string | null;
}): ApplicantStatus {
  if (lead.status === "sold") return "sold";
  if (lead.status === "expired" || lead.expired_at) return "expired";
  if (lead.status === "available") return "matching";
  if (lead.status === "qualified") return "qualification_complete";
  if (lead.status === "specialist_review") return "specialist_follow_up";
  if (lead.retell_call_status === "in_progress") return "qualification_in_progress";
  if (lead.status === "qualifying" || lead.status === "new") return "received";
  return "unknown";
}

const APPLICANT_STATUS_LABELS: Record<
  ApplicantStatus,
  { label: string; blurb: string }
> = {
  received: {
    label: "Application received",
    blurb:
      "A NewWheels specialist will call you shortly to walk through your application. " +
      "While you wait, upload your documents below so we can match you faster.",
  },
  qualification_in_progress: {
    label: "Qualification in progress",
    blurb:
      "Our specialist is on the call with you. Please complete any document uploads " +
      "they ask for from this page on your phone.",
  },
  qualification_complete: {
    label: "Application complete",
    blurb:
      "Thanks — we have everything we need. We're matching you with the right partner now.",
  },
  matching: {
    label: "Being matched",
    blurb:
      "We're matching you with a dealer or lender partner now. You'll hear back within 1 business day.",
  },
  specialist_follow_up: {
    label: "A specialist will be in touch",
    blurb:
      "We're still working on your match — a NewWheels specialist will follow up directly.",
  },
  sold: {
    label: "Still working on your match",
    blurb:
      "We're still working on your match. A NewWheels specialist will follow up directly.",
  },
  expired: {
    label: "Application closed",
    blurb:
      "It's been a while since your application — if you're still looking, please reapply at newwheels.ca and we'll connect you with a fresh partner.",
  },
  unknown: {
    label: "Application received",
    blurb:
      "We're processing your application. A NewWheels specialist will be in touch shortly.",
  },
};

// -----------------------------------------------------------------
// Document upload
// -----------------------------------------------------------------

export const SUPPORTED_DOC_KINDS = [
  "drivers_licence_front",
  "drivers_licence_back",
  "work_permit",
  "study_permit",
  "proof_of_income",
  "bank_statement",
  "other",
] as const;
export type LeadDocumentKind = (typeof SUPPORTED_DOC_KINDS)[number];

export const SUPPORTED_DOC_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
  "application/pdf",
];

export const MAX_DOC_BYTES = 25 * 1024 * 1024;

export const APPLICANT_DOCS_BUCKET = "applicant-docs";

export function isSupportedDocKind(value: string): value is LeadDocumentKind {
  return (SUPPORTED_DOC_KINDS as readonly string[]).includes(value);
}

export type SaveDocumentInput = {
  lead_id: string;
  apply_token: string;
  kind: LeadDocumentKind;
  bytes: Buffer;
  mime_type: string;
  original_filename: string | null;
  uploaded_via_ip?: string | null;
  uploaded_user_agent?: string | null;
};

export type SaveDocumentResult =
  | { ok: true; document_id: string; storage_object_key: string }
  | { ok: false; error: string };

/** Upload a single document to the private bucket and record metadata. */
export async function saveLeadDocument(input: SaveDocumentInput): Promise<SaveDocumentResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "not_configured" };
  if (input.bytes.byteLength === 0) return { ok: false, error: "empty_file" };
  if (input.bytes.byteLength > MAX_DOC_BYTES) return { ok: false, error: "file_too_large" };
  if (!SUPPORTED_DOC_MIME_TYPES.includes(input.mime_type))
    return { ok: false, error: "unsupported_mime" };

  const ext = mimeToExt(input.mime_type);
  const objectKey = `${input.lead_id}/${input.kind}/${Date.now()}-${randomSlug()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(APPLICANT_DOCS_BUCKET)
    .upload(objectKey, input.bytes, {
      contentType: input.mime_type,
      upsert: false,
    });

  if (uploadErr) {
    return { ok: false, error: `storage:${uploadErr.message ?? "upload_failed"}` };
  }

  const { data: row, error: rowErr } = await supabase
    .from("lead_documents")
    .insert({
      lead_id: input.lead_id,
      kind: input.kind,
      storage_object_key: objectKey,
      original_filename: input.original_filename?.slice(0, 200) ?? null,
      mime_type: input.mime_type,
      size_bytes: input.bytes.byteLength,
      uploaded_via_ip: input.uploaded_via_ip ?? null,
      uploaded_user_agent: input.uploaded_user_agent?.slice(0, 500) ?? null,
      uploaded_via_token: true,
    })
    .select("id")
    .single();

  if (rowErr || !row) {
    // Best-effort cleanup if the metadata insert failed.
    await supabase.storage.from(APPLICANT_DOCS_BUCKET).remove([objectKey]);
    return { ok: false, error: `db:${rowErr?.message ?? "insert_failed"}` };
  }

  return { ok: true, document_id: row.id as string, storage_object_key: objectKey };
}

// -----------------------------------------------------------------
// Signed URL helpers for CRM + buyer portal document viewing
// -----------------------------------------------------------------

export type LeadDocumentRow = {
  id: string;
  kind: string;
  original_filename: string | null;
  mime_type: string;
  storage_object_key: string;
  created_at: string;
};

export type LeadDocumentWithUrl = LeadDocumentRow & {
  signed_url: string | null;
};

export async function getLeadDocumentsWithUrls(
  leadId: string,
  ttlSec = 600,
): Promise<LeadDocumentWithUrl[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const { data: docs } = await supabase
    .from("lead_documents")
    .select("id, kind, original_filename, mime_type, storage_object_key, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  if (!docs || docs.length === 0) return [];

  const results: LeadDocumentWithUrl[] = [];
  for (const doc of docs) {
    const { data } = await supabase.storage
      .from(APPLICANT_DOCS_BUCKET)
      .createSignedUrl(doc.storage_object_key as string, ttlSec);
    results.push({
      id: doc.id as string,
      kind: doc.kind as string,
      original_filename: doc.original_filename as string | null,
      mime_type: doc.mime_type as string,
      storage_object_key: doc.storage_object_key as string,
      created_at: doc.created_at as string,
      signed_url: data?.signedUrl ?? null,
    });
  }
  return results;
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case "image/jpeg": return "jpg";
    case "image/png": return "png";
    case "image/heic": return "heic";
    case "image/heif": return "heif";
    case "image/webp": return "webp";
    case "application/pdf": return "pdf";
    default: return "bin";
  }
}

function randomSlug(): string {
  return Math.random().toString(36).slice(2, 10);
}
