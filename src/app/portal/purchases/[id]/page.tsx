// /portal/purchases/[id] — full unlocked lead detail page for a buyer.

import { notFound } from "next/navigation";
import Link from "next/link";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { priceCentsToDisplay } from "@/lib/crm/pricing";
import { maskSin, decryptSin } from "@/lib/crm/security/sin";
import { BuyerSinRevealButton } from "@/components/portal/SinRevealButton";
import { matchLenders } from "@/lib/crm/lender-match";
import { getLeadDocumentsWithUrls } from "@/lib/crm/leads/apply";

export const dynamic = "force-dynamic";

export default async function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { subject } = await requireBuyer();
  const supabase = getServerSupabase();
  if (!supabase) return notFound();

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, amount_cents, tier, purchased_at, lead_id, buyer_id")
    .eq("id", id)
    .single();
  if (!purchase || purchase.buyer_id !== subject.buyer_account_id) return notFound();

  const { data: lead } = await supabase
    .from("leads")
    .select("first_name, last_name, email, phone, raw_payload, sin_encrypted")
    .eq("id", purchase.lead_id)
    .single();
  if (!lead) return notFound();

  const { data: qual } = await supabase
    .from("lead_qualifications")
    .select("*")
    .eq("lead_id", purchase.lead_id)
    .maybeSingle();

  const payload = (lead.raw_payload as Record<string, unknown> | null) ?? {};

  // SIN reveal - check if buyer signed agreement
  const { data: buyerAccount } = await supabase
    .from("buyer_accounts")
    .select("id, sin_reveal_agreement_at")
    .eq("id", subject.buyer_account_id)
    .single();
  const agreementSigned = Boolean(buyerAccount?.sin_reveal_agreement_at);

  // Masked SIN for display
  let sinMasked: string | null = null;
  const hasSin = Boolean(lead.sin_encrypted);
  if (hasSin) {
    try {
      const plain = decryptSin(lead.sin_encrypted as string);
      sinMasked = maskSin(plain);
    } catch {
      sinMasked = "*** *** ***";
    }
  }

  // Lender match recommendations
  let lenderMatches: { lender: string; reason: string }[] = [];
  if (qual) {
    try {
      lenderMatches = matchLenders(qual as Parameters<typeof matchLenders>[0]);
    } catch { /* qualification data may be incomplete */ }
  }

  // Lead documents with signed URLs
  const leadDocuments = await getLeadDocumentsWithUrls(purchase.lead_id as string);

  return (
    <div className="space-y-6">
      <Link href="/portal/purchases" className="text-sm text-[#0A2818] underline">← My leads</Link>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">{lead.first_name} {lead.last_name}</h1>
            <p className="text-sm text-[#6B7280]">Purchased {new Date(purchase.purchased_at as string).toLocaleString("en-CA")} · {priceCentsToDisplay(purchase.amount_cents)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-[#6B7280]">Tier</p>
            <p className="font-bold uppercase">{purchase.tier as string}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-[#F1F2EE]">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#6B7280]">Phone</p>
            <a href={`tel:${lead.phone}`} className="font-extrabold text-[#0A2818] text-xl">{lead.phone}</a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#6B7280]">Email</p>
            <a href={`mailto:${lead.email}`} className="font-extrabold text-[#0A2818]">{lead.email}</a>
          </div>
        </div>

        {payload.situation_summary ? (
          <p className="text-sm text-[#0A2818] pt-4 border-t border-[#F1F2EE]">{payload.situation_summary as string}</p>
        ) : null}

        {qual ? (
          <div className="pt-4 border-t border-[#F1F2EE]">
            <h2 className="text-base font-extrabold text-[#0A2818] mb-2">Qualification details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <Row label="Visa / residency" value={qual.visa_status as string} />
              <Row label="Time in Canada" value={qual.time_in_canada as string} />
              <Row label="AB licence" value={qual.has_ab_licence ? "Yes" : "No"} />
              <Row label="Monthly income" value={qual.monthly_income as string} />
              <Row label="Income type" value={qual.income_type as string} />
              <Row label="Time at income" value={qual.time_at_income as string} />
              <Row label="Monthly debt" value={qual.monthly_debt as string} />
              <Row label="Credit score" value={qual.credit_score as string} />
              <Row label="Active bankruptcy" value={qual.active_bankruptcy ? "Yes" : "No"} />
              <Row label="Discharged bankruptcy" value={qual.discharged_bankruptcy ? "Yes" : "No"} />
              <Row label="Consumer proposal" value={qual.active_consumer_proposal ? "Yes" : "No"} />
              <Row label="Recent decline" value={qual.declined_last_6mo ? "Yes" : "No"} />
              <Row label="Collections" value={qual.outstanding_collections ? "Yes" : "No"} />
              <Row label="New or used" value={qual.new_or_used as string} />
              <Row label="Body type" value={qual.body_type as string} />
              <Row label="Total budget" value={qual.total_budget as string} />
              <Row label="Monthly payment" value={qual.monthly_payment_target as string} />
              <Row label="Down payment" value={qual.down_payment as string} />
              <Row label="Trade-in" value={qual.trade_in ? "Yes" : "No"} />
              <Row label="Timeline" value={qual.purchase_timeline as string} />
              <Row label="Best contact time" value={qual.preferred_contact_time as string} />
              <Row label="Language" value={qual.preferred_language as string} />
            </dl>
            {qual.notes ? (
              <p className="text-sm text-[#0A2818] mt-3"><strong>Notes:</strong> {qual.notes as string}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* SIN reveal — only if lead has SIN and buyer signed agreement */}
      {hasSin && sinMasked ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="font-extrabold text-[#0A2818] mb-2">Social Insurance Number</h2>
          <BuyerSinRevealButton purchaseId={purchase.id as string} masked={sinMasked} agreementSigned={agreementSigned} />
          {!agreementSigned && (
            <p className="mt-2 text-xs text-[#6B7280]">You must sign the data sharing agreement in your account settings before viewing the SIN.</p>
          )}
        </div>
      ) : null}

      {/* Lender match recommendations */}
      {lenderMatches.length > 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="font-extrabold text-[#0A2818] mb-1">Suggested lender match</h2>
          <p className="text-xs text-[#6B7280] mb-3 italic">This is a recommendation, not a guarantee</p>
          <div className="space-y-2">
            {lenderMatches.map((m) => (
              <div key={m.lender} className="flex items-start gap-3 rounded-lg border border-[#E5E1D8] bg-[#FAF7F0] px-4 py-3">
                <span className="text-sm font-bold text-[#0A2818]">{m.lender}</span>
                <span className="text-xs text-[#6B7280]">{m.reason}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Applicant documents */}
      {leadDocuments.length > 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="font-extrabold text-[#0A2818] mb-1">Applicant documents</h2>
          <p className="text-xs text-[#6B7280] mb-3">Uploaded by the applicant. Links expire in 10 minutes.</p>
          <div className="space-y-2">
            {leadDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border border-[#E5E1D8] bg-[#FAF7F0] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#0A2818]">
                    {doc.kind.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {doc.original_filename ?? "file"} · {new Date(doc.created_at).toLocaleString("en-CA")}
                  </p>
                </div>
                {doc.signed_url ? (
                  <a
                    href={doc.signed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-[#0E3D24] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#155235]"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-xs text-[#6B7280]">Unavailable</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#E5E7EB] bg-[#F5F7F4] p-6">
        <h2 className="font-extrabold text-[#0A2818] mb-2">Wrong number or disconnected?</h2>
        <p className="text-sm text-[#0A2818]">You have 24 hours from purchase to flag a bad number for review. Credits are issued at NewWheels CEO discretion.</p>
        <form action={`/api/portal/purchases/${purchase.id}/dispute`} method="post" className="mt-3 flex flex-col md:flex-row gap-2">
          <input name="detail" placeholder="Briefly describe the issue" className="portal-input flex-1" maxLength={300} required />
          <button type="submit" className="btn-secondary">Flag for review</button>
        </form>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[#F1F2EE] py-1">
      <span className="text-xs uppercase tracking-wider text-[#6B7280]">{label}</span>
      <span className="text-sm font-semibold text-[#0A2818]">{value || "—"}</span>
    </div>
  );
}
