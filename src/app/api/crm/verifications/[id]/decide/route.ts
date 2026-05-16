// POST /api/crm/verifications/:id/decide — CEO-only verification decision.

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { readSession } from "@/lib/crm/auth/session";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { verificationApprovedEmail, verificationRejectedEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REASONS = {
  invalid_amvic: "Invalid AMVIC licence",
  id_mismatch: "ID does not match contact",
  incomplete_documents: "Incomplete documents",
  other: "Other",
} as const;

const Body = z.union([
  z.object({ decision: z.literal("approved") }),
  z.object({ decision: z.literal("rejected"), rejection_reason: z.enum(["invalid_amvic", "id_mismatch", "incomplete_documents", "other"]) }),
]);

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireTeam("ceo");
  const session = await readSession("crm");
  if (!session || session.subject.kind !== "team") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: buyer } = await supabase
    .from("buyer_accounts")
    .select("id, status, email, contact_name, business_name")
    .eq("id", id)
    .single();
  if (!buyer) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  if (buyer.status !== "pending_verification") {
    return NextResponse.json({ ok: false, error: "already_decided" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    status: parsed.data.decision === "approved" ? "active" : "rejected",
    verified_at: parsed.data.decision === "approved" ? now : null,
    rejection_reason: parsed.data.decision === "rejected" ? REASONS[parsed.data.rejection_reason] : null,
  };
  const { error: upErr } = await supabase.from("buyer_accounts").update(update).eq("id", id);
  if (upErr) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });

  await supabase.from("verification_decisions").insert({
    buyer_id: id,
    decided_by: session.subject.team_member_id,
    decision: parsed.data.decision,
    rejection_reason: parsed.data.decision === "rejected" ? parsed.data.rejection_reason : null,
  });

  const portalUrl = (process.env.NW_PORTAL_URL || "https://portal.newwheels.ca").replace(/\/$/, "");
  if (parsed.data.decision === "approved") {
    void sendEmail({
      to: buyer.email as string,
      subject: "You're approved — NewWheels Buyer Portal",
      html: verificationApprovedEmail({
        contactName: (buyer.business_name as string) || (buyer.contact_name as string) || "there",
        portalUrl: `${portalUrl}/portal/account/payment`,
      }),
      tags: [{ name: "type", value: "verification_approved" }],
    });
  } else {
    void sendEmail({
      to: buyer.email as string,
      subject: "Update on your NewWheels application",
      html: verificationRejectedEmail({
        contactName: (buyer.business_name as string) || (buyer.contact_name as string) || "there",
        reasonLabel: REASONS[parsed.data.rejection_reason],
      }),
      tags: [{ name: "type", value: "verification_rejected" }],
    });
  }

  return NextResponse.json({ ok: true });
}
