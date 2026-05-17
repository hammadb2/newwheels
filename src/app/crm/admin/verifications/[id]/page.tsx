// /crm/admin/verifications/:id — review one buyer application.
// CEO only. Renders document previews via short-lived signed URLs.

import { notFound } from "next/navigation";
import Link from "next/link";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { signedVerificationDocUrl } from "@/lib/crm/storage";
import { VerificationDecisionClient } from "@/components/crm/VerificationDecisionClient";

export const dynamic = "force-dynamic";

export default async function VerificationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireTeam("ceo");
  const supabase = getServerSupabase();
  if (!supabase) return notFound();

  const { data: buyer } = await supabase
    .from("buyer_accounts")
    .select("id, kind, status, business_name, contact_name, first_name, last_name, email, phone, amvic_licence, business_address, dealership_name, dealership_address, dealership_phone, created_at, rejection_reason")
    .eq("id", id)
    .single();
  if (!buyer) return notFound();

  const { data: docs } = await supabase
    .from("buyer_verification_docs")
    .select("id, doc_kind, original_filename, storage_path, mime_type, size_bytes, uploaded_at")
    .eq("buyer_id", id)
    .order("uploaded_at", { ascending: true });

  const docsWithUrls = await Promise.all(
    (docs ?? []).map(async (d) => ({
      ...d,
      url: await signedVerificationDocUrl(d.storage_path as string),
    })),
  );

  return (
    <div className="space-y-6">
      <Link href="/crm/admin/verifications" className="text-sm text-[#0A2818] underline">← Back to queue</Link>

      <div className="crm-card">
        <h1 className="text-2xl font-extrabold text-[#0A2818]">{(buyer.business_name as string) || (buyer.contact_name as string)}</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {buyer.kind === "dealer_master" ? "Dealer master account" : "Individual buyer"} · status <strong>{(buyer.status as string).replace(/_/g, " ")}</strong>
        </p>
        <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {buyer.business_name ? <Row label="Business name" value={buyer.business_name as string} /> : null}
          {buyer.business_address ? <Row label="Business address" value={buyer.business_address as string} /> : null}
          {(buyer.first_name || buyer.last_name) ? (
            <Row label="Name" value={`${buyer.first_name ?? ""} ${buyer.last_name ?? ""}`.trim()} />
          ) : (
            <Row label="Contact" value={buyer.contact_name as string} />
          )}
          <Row label="Email" value={buyer.email as string} />
          <Row label="Phone" value={buyer.phone as string} />
          <Row label="AMVIC licence" value={buyer.amvic_licence as string} />
          {buyer.dealership_name ? <Row label="Dealership" value={buyer.dealership_name as string} /> : null}
          {buyer.dealership_address ? <Row label="Dealership address" value={buyer.dealership_address as string} /> : null}
          {buyer.dealership_phone ? <Row label="Dealership phone" value={buyer.dealership_phone as string} /> : null}
          <Row label="Submitted" value={new Date(buyer.created_at as string).toLocaleString("en-CA")} />
        </dl>
      </div>

      <div className="crm-card space-y-3">
        <h2>Documents</h2>
        {docsWithUrls.length === 0 ? (
          <p className="text-sm text-red-700">No documents on file — something went wrong with the upload.</p>
        ) : (
          docsWithUrls.map((d) => (
            <div key={d.id as string} className="rounded-lg border border-[#E5E7EB] p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#0A2818]">{(d.doc_kind as string).replace(/_/g, " ")} · {d.original_filename}</p>
                {d.url ? <a className="text-sm underline text-[#0A2818]" href={d.url} target="_blank" rel="noopener noreferrer">Open document</a> : <span className="text-xs text-[#6B7280]">No signed URL</span>}
              </div>
              {d.url && (d.mime_type as string).startsWith("image/") ? (
                <img src={d.url} alt={d.original_filename as string} className="mt-2 max-h-64 rounded border border-[#E5E7EB]" />
              ) : null}
            </div>
          ))
        )}
      </div>

      {(buyer.status as string) === "pending_verification" ? (
        <VerificationDecisionClient buyerId={id} />
      ) : (
        <div className="crm-card">
          <p className="text-sm text-[#0A2818]">
            Decision: <strong>{(buyer.status as string).replace(/_/g, " ")}</strong>
            {buyer.rejection_reason ? ` — ${buyer.rejection_reason as string}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-[#F1F2EE] py-1">
      <span className="text-xs uppercase tracking-wider text-[#6B7280]">{label}</span>
      <span className="font-semibold text-[#0A2818] text-right">{value}</span>
    </div>
  );
}
