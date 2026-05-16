// GET /api/apply/<token>/status — applicant-facing status JSON.
//
// Used by the client-side document upload form to refresh the "received/needed"
// checklist after each upload. Returns the same narrow payload the page uses.

import { NextResponse } from "next/server";
import { getApplicantStatus, isProbablyToken } from "@/lib/crm/leads/apply";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  if (!isProbablyToken(token)) {
    return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 400 });
  }
  const status = await getApplicantStatus(token);
  if (!status) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(
    {
      ok: true,
      status: status.status,
      status_label: status.status_label,
      status_blurb: status.status_blurb,
      first_name: status.first_name,
      documents: status.documents,
      verified: status.verified,
      uploads_open: status.uploads_open,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
