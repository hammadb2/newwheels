// /crm/leads — Lead Qualifier list. CEO/Ops also see this.
// IMPORTANT: We never show the `score` column to anyone other than CEO/Ops.

import Link from "next/link";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { ROLE_LABEL } from "@/lib/crm/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads — NewWheels CRM" };

export default async function LeadsPage() {
  const { subject } = await requireTeam("any_team");
  const supabase = getServerSupabase();
  if (!supabase) {
    return (
      <div className="crm-card">
        <h2>Supabase not configured</h2>
        <p className="text-sm text-[#6B7280]">Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to use this page.</p>
      </div>
    );
  }

  // Lead Qualifier sees their assigned + new. CEO + Ops see everything.
  let query = supabase
    .from("leads")
    .select("id, first_name, last_name, phone, email, status, source_page, created_at, duplicate_of")
    .order("created_at", { ascending: false })
    .limit(200);

  if (subject.role === "lead_qualifier") {
    query = query.in("status", ["qualifying", "new"]).or(
      `assigned_qualifier_id.eq.${subject.team_member_id},assigned_qualifier_id.is.null`,
    );
  }

  const { data: leads, error } = await query;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Leads</h1>
          <p className="text-sm text-[#6B7280] mt-1">Signed in as {ROLE_LABEL[subject.role]}</p>
        </div>
      </div>

      <div className="crm-card overflow-x-auto p-0">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Phone</th>
              <th>Source</th>
              <th>Received</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!leads || leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-sm text-[#6B7280] py-8">
                  {error ? `Failed to load leads: ${error.message}` : "No leads yet."}
                </td>
              </tr>
            ) : (
              leads.map((l) => (
                <tr key={l.id as string}>
                  <td>
                    <div className="font-semibold text-[#0A2818]">{l.first_name} {l.last_name}</div>
                    <div className="text-xs text-[#6B7280]">{l.email}</div>
                    {l.duplicate_of ? (
                      <div className="text-xs text-amber-700 mt-1">⚠ duplicate of an earlier lead</div>
                    ) : null}
                  </td>
                  <td><StatusPill status={l.status as string} /></td>
                  <td className="text-sm text-[#0A2818]">{l.phone}</td>
                  <td className="text-xs text-[#6B7280]">{l.source_page ?? "—"}</td>
                  <td className="text-xs text-[#6B7280]">{new Date(l.created_at as string).toLocaleString("en-CA")}</td>
                  <td>
                    <Link href={`/crm/leads/${l.id}`} className="crm-btn crm-btn-secondary">
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const pillClass = ({
    new: "crm-pill crm-pill-new",
    qualifying: "crm-pill crm-pill-new",
    qualified: "crm-pill crm-pill-hot",
    available: "crm-pill crm-pill-hot",
    sold: "crm-pill crm-pill-sold",
    expired: "crm-pill crm-pill-exp",
    unqualified: "crm-pill crm-pill-exp",
    duplicate: "crm-pill crm-pill-pend",
  } as Record<string, string>)[status] ?? "crm-pill crm-pill-std";
  return <span className={pillClass}>{status}</span>;
}
