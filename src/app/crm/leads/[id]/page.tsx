// /crm/leads/:id — lead detail + qualification form.
// Hides score/tier/price from the Lead Qualifier.

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { ROLE_LABEL } from "@/lib/crm/types";
import { QualificationForm } from "@/components/crm/QualificationForm";
import { LeadNotesThread } from "@/components/crm/LeadNotesThread";
import { canReadLeadNotes, canWriteLeadNotes, listLeadNotes } from "@/lib/crm/leads/notes";
import { priceCentsToDisplay } from "@/lib/crm/pricing";
import { RetellCallPlayer } from "@/components/crm/RetellCallPlayer";
import { SinRevealButton } from "@/components/crm/SinRevealButton";
import { LeadPriceOverride } from "@/components/crm/LeadPriceOverride";
import { maskSin, decryptSin } from "@/lib/crm/security/sin";
import { matchLenders } from "@/lib/crm/lender-match";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { subject } = await requireTeam("lead_qualifier");
  const supabase = getServerSupabase();
  if (!supabase) return notFound();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, first_name, last_name, email, phone, status, source_page, created_at, duplicate_of, tier, score, current_price_cents, available_at, retell_call_id, retell_call_status, retell_recording_url, retell_call_duration_seconds, retell_transcript, retell_transcript_object, retell_call_summary, retell_user_sentiment, retell_call_analysis, follow_up_needed, preferred_contact_time, sin_encrypted, price_override_cents, fraud_risk, fraud_flags")
    .eq("id", id)
    .single();
  if (!lead) return notFound();

  const { data: existingQual } = await supabase
    .from("lead_qualifications")
    .select("id")
    .eq("lead_id", id)
    .maybeSingle();

  const isCeoOrOps = subject.role === "ceo" || subject.role === "platform_ops";
  const showNotes = canReadLeadNotes(subject.role);
  const notes = showNotes ? await listLeadNotes(id) : [];

  // SIN masked display for CEO
  let sinMasked: string | null = null;
  if (subject.role === "ceo" && lead.sin_encrypted) {
    try {
      const plain = decryptSin(lead.sin_encrypted as string);
      sinMasked = maskSin(plain);
    } catch {
      sinMasked = "*** *** ***";
    }
  }

  // Lender match for CEO / Ops
  let lenderMatches: { lender: string; reason: string }[] = [];
  if (isCeoOrOps && existingQual) {
    const { data: qualData } = await supabase
      .from("lead_qualifications")
      .select("*")
      .eq("lead_id", id)
      .maybeSingle();
    if (qualData) {
      try {
        lenderMatches = matchLenders(qualData as Parameters<typeof matchLenders>[0]);
      } catch { /* scoring data may be incomplete */ }
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/crm/leads" className="text-sm text-[#0A2818] underline">← Back to leads</Link>

      <div className="crm-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0A2818]">{lead.first_name} {lead.last_name}</h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {lead.email} · {lead.phone} · source {lead.source_page ?? "—"}
            </p>
            <p className="text-xs text-[#6B7280] mt-1">Submitted {new Date(lead.created_at as string).toLocaleString("en-CA")}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-[#6B7280]">Status</p>
            <p className="font-bold text-[#0A2818]">{lead.status}</p>
          </div>
        </div>

        {lead.duplicate_of ? (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Duplicate submission — previous lead on file from this contact in the last 60 days.
          </div>
        ) : null}
      </div>

      {/* Retell call — CEO / Ops only. */}
      {isCeoOrOps && lead.retell_call_id ? (
        <div className="crm-card">
          <RetellCallPlayer
            leadId={id}
            recordingUrl={(lead.retell_recording_url as string) ?? ""}
            callStatus={(lead.retell_call_status as string) ?? ""}
            durationSeconds={(lead.retell_call_duration_seconds as number) ?? null}
            callId={lead.retell_call_id as string}
            transcript={(lead.retell_transcript as string) ?? null}
            transcriptObject={(lead.retell_transcript_object as { role: string; content: string }[]) ?? null}
            callSummary={(lead.retell_call_summary as string) ?? null}
            userSentiment={(lead.retell_user_sentiment as string) ?? null}
          />
        </div>
      ) : null}

      {/* Follow-up needed banner */}
      {isCeoOrOps && lead.follow_up_needed ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-semibold">Follow-up needed</span> — applicant did not answer the qualification call.
          {lead.preferred_contact_time ? (
            <span> Preferred contact time: <strong>{lead.preferred_contact_time as string}</strong></span>
          ) : null}
        </div>
      ) : null}

      {/* Score + price block — CEO / Ops only. Qualifier never sees this. */}
      {isCeoOrOps && lead.status === "available" ? (
        <div className="crm-card">
          <h2>Marketplace listing</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#6B7280]">Tier</p>
              <p className="font-bold uppercase">{lead.tier ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#6B7280]">Score</p>
              <p className="font-bold">{lead.score ?? "—"} / 100</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#6B7280]">Current price</p>
              <p className="font-bold">{lead.current_price_cents ? priceCentsToDisplay(lead.current_price_cents) : "—"}</p>
            </div>
          </div>
          {subject.role === "ceo" ? (
            <div className="mt-4 border-t border-[#E5E1D8] pt-4">
              <LeadPriceOverride
                leadId={id}
                currentPriceCents={(lead.current_price_cents as number) ?? null}
                overrideCents={(lead.price_override_cents as number) ?? null}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {/* SIN reveal — CEO only */}
      {subject.role === "ceo" && lead.sin_encrypted ? (
        <div className="crm-card">
          <h2>Social Insurance Number</h2>
          <SinRevealButton leadId={id} masked={sinMasked ?? "*** *** ***"} />
        </div>
      ) : null}

      {/* Fraud risk banner */}
      {isCeoOrOps && lead.fraud_risk ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          <span className="font-semibold">Fraud risk detected</span>
          {Array.isArray(lead.fraud_flags) && (lead.fraud_flags as string[]).length > 0 ? (
            <ul className="mt-1 list-disc pl-5 space-y-0.5 text-xs">
              {(lead.fraud_flags as string[]).map((flag, i) => (
                <li key={i}>{flag}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {/* Credit bracket from Equifax — requires credit_bracket column (future migration) */}

      {/* Lender match — CEO / Ops only */}
      {isCeoOrOps && lenderMatches.length > 0 ? (
        <div className="crm-card">
          <h2>Suggested lender match</h2>
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

      {existingQual ? (
        <div className="crm-card">
          <h2>Qualification submitted</h2>
          <p className="text-sm text-[#0A2818]">This lead has already been qualified.</p>
        </div>
      ) : (
        <div className="crm-card">
          <h2>Qualification checklist</h2>
          <p className="text-sm text-[#6B7280] mb-4">Signed in as {ROLE_LABEL[subject.role]}. Submit when the call is done.</p>
          <QualificationForm leadId={id} />
        </div>
      )}

      {showNotes ? (
        <div className="crm-card">
          <LeadNotesThread
            leadId={id}
            initialNotes={notes}
            canWrite={canWriteLeadNotes(subject.role)}
          />
        </div>
      ) : null}
    </div>
  );
}
