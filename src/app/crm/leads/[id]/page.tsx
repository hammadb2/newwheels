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

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { subject } = await requireTeam("lead_qualifier");
  const supabase = getServerSupabase();
  if (!supabase) return notFound();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, first_name, last_name, email, phone, status, source_page, created_at, duplicate_of, tier, score, current_price_cents, available_at, retell_call_id, retell_call_status, retell_recording_url, retell_call_duration_seconds")
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

      {/* Retell call recording — CEO / Ops only. */}
      {isCeoOrOps && lead.retell_call_id ? (
        <div className="crm-card">
          <RetellCallPlayer
            recordingUrl={(lead.retell_recording_url as string) ?? ""}
            callStatus={(lead.retell_call_status as string) ?? ""}
            durationSeconds={(lead.retell_call_duration_seconds as number) ?? null}
            callId={lead.retell_call_id as string}
          />
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
