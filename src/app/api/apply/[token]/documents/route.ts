// POST /api/apply/<token>/documents — applicant document upload.
//
// Token-gated, multipart form: { kind: <doc kind>, file: <File> }.
// We validate the token resolves to a real lead, then push the file bytes
// straight to the private applicant-docs bucket via the service-role client.
// The applicant never sees Supabase credentials.

import { NextResponse } from "next/server";
import {
  findLeadByApplyToken,
  isProbablyToken,
  isSupportedDocKind,
  saveLeadDocument,
  MAX_DOC_BYTES,
} from "@/lib/crm/leads/apply";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  if (!isProbablyToken(token)) {
    return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 400 });
  }

  const lead = await findLeadByApplyToken(token);
  if (!lead) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  // Don't let uploads land once a lead is sold or expired — those leads
  // are out of the verification flow.
  if (lead.status === "sold" || lead.status === "expired" || lead.expired_at) {
    return NextResponse.json({ ok: false, error: "uploads_closed" }, { status: 409 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_form" }, { status: 400 });
  }

  const kindRaw = form.get("kind");
  if (typeof kindRaw !== "string" || !isSupportedDocKind(kindRaw)) {
    return NextResponse.json({ ok: false, error: "invalid_kind" }, { status: 400 });
  }

  const fileEntry = form.get("file");
  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ ok: false, error: "no_file" }, { status: 400 });
  }
  if (fileEntry.size === 0) {
    return NextResponse.json({ ok: false, error: "empty_file" }, { status: 400 });
  }
  if (fileEntry.size > MAX_DOC_BYTES) {
    return NextResponse.json({ ok: false, error: "file_too_large" }, { status: 413 });
  }

  const bytes = Buffer.from(await fileEntry.arrayBuffer());
  const ip = ipFromRequest(req);
  const ua = req.headers.get("user-agent")?.slice(0, 500) ?? null;

  const result = await saveLeadDocument({
    lead_id: lead.id,
    apply_token: token,
    kind: kindRaw,
    bytes,
    mime_type: fileEntry.type || "application/octet-stream",
    original_filename: fileEntry.name || null,
    uploaded_via_ip: ip,
    uploaded_user_agent: ua,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    document_id: result.document_id,
    kind: kindRaw,
  });
}

function ipFromRequest(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? null;
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return null;
}
