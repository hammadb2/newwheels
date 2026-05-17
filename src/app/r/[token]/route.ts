// GET /r/:token — community referral redirect.
//
// Redirects to the main site with the referral token as a query param.
// The lead intake form reads the ref param and stores the referrer.

import { redirect } from "next/navigation";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  const url = `${SITE_URL}?ref=${encodeURIComponent(token)}`;
  redirect(url);
}
