// POST /api/portal/signup — buyer signup (dealer master or individual).
// Multipart form data: kind, email, contact_name, phone, amvic_licence,
// business_name?, business_address?, amvic_doc (File), gov_id_doc (File).

import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { uploadVerificationDoc } from "@/lib/crm/storage";
import { sendEmail, SYSTEM_FROM } from "@/lib/email/resend";
import { buyerApplicationEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 250;

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_form" }, { status: 400 });
  }

  const kind = String(form.get("kind") ?? "");
  if (kind !== "dealer_master" && kind !== "individual") {
    return NextResponse.json({ ok: false, error: "invalid_kind" }, { status: 400 });
  }
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, MAX_TEXT);
  const contact_name = String(form.get("contact_name") ?? "").trim().slice(0, MAX_TEXT);
  const phone = String(form.get("phone") ?? "").trim().slice(0, 40);
  const amvic_licence = String(form.get("amvic_licence") ?? "").trim().slice(0, 80);

  if (!email || !contact_name || !phone || !amvic_licence) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const business_name = kind === "dealer_master" ? String(form.get("business_name") ?? "").trim().slice(0, MAX_TEXT) : null;
  const business_address = kind === "dealer_master" ? String(form.get("business_address") ?? "").trim().slice(0, 500) : null;
  if (kind === "dealer_master" && (!business_name || !business_address)) {
    return NextResponse.json({ ok: false, error: "missing_dealer_fields" }, { status: 400 });
  }

  const amvicDoc = form.get("amvic_doc");
  const idDoc = form.get("gov_id_doc");
  if (!(amvicDoc instanceof File) || !(idDoc instanceof File)) {
    return NextResponse.json({ ok: false, error: "missing_documents" }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // Refuse duplicate email outright.
  const { data: existing } = await supabase
    .from("buyer_accounts")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: false, error: "email_in_use" }, { status: 409 });
  }

  const { data: inserted, error: insErr } = await supabase
    .from("buyer_accounts")
    .insert({
      kind,
      status: "pending_verification",
      email,
      contact_name,
      phone,
      amvic_licence,
      business_name,
      business_address,
    })
    .select("id")
    .single();

  if (insErr || !inserted) {
    console.error("buyer signup insert failed", insErr);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  const buyer_id = inserted.id as string;
  try {
    const amvicUploaded = await uploadVerificationDoc({
      buyer_id,
      doc_kind: "amvic_licence",
      file: amvicDoc,
    });
    const idUploaded = await uploadVerificationDoc({
      buyer_id,
      doc_kind: "gov_id",
      file: idDoc,
    });

    const { error: docInsertErr } = await supabase.from("buyer_verification_docs").insert([
      { buyer_id, doc_kind: "amvic_licence", ...amvicUploaded },
      { buyer_id, doc_kind: "gov_id", ...idUploaded },
    ]);
    if (docInsertErr) {
      console.error("buyer_verification_docs insert failed", docInsertErr);
      await supabase.from("buyer_accounts").delete().eq("id", buyer_id);
      return NextResponse.json({ ok: false, error: "doc_insert_failed" }, { status: 500 });
    }
  } catch (e) {
    // Roll back the buyer record if the uploads fail so we don't leave a
    // pending buyer with no documents.
    console.error("uploadVerificationDoc failed", e);
    await supabase.from("buyer_accounts").delete().eq("id", buyer_id);
    const code = e instanceof Error ? e.message : "upload_failed";
    return NextResponse.json({ ok: false, error: code }, { status: 400 });
  }

  // Notify CEO + any platform_ops team members.
  const { data: ceos } = await supabase
    .from("team_members")
    .select("email")
    .in("role", ["ceo", "platform_ops"])
    .eq("active", true);
  const recipients = (ceos ?? []).map((r) => r.email as string);
  if (recipients.length > 0) {
    const crmUrl = (process.env.NW_CRM_URL || "https://crm.newwheels.ca").replace(/\/$/, "");
    void sendEmail({
      from: SYSTEM_FROM,
      to: recipients,
      subject: `New buyer application: ${business_name || contact_name}`,
      html: buyerApplicationEmail({
        name: (business_name || contact_name) as string,
        email,
        kind: kind as "dealer_master" | "individual",
        phone,
        amvicLicence: amvic_licence,
        reviewUrl: `${crmUrl}/crm/admin/verifications/${buyer_id}`,
      }),
      tags: [{ name: "type", value: "verification_submitted" }],
    });
  }

  return NextResponse.json({ ok: true, buyer_id });
}
