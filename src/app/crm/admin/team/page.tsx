// /crm/admin/team — CEO manages team members.

import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { ROLE_LABEL } from "@/lib/crm/types";
import { AddTeamMemberClient } from "@/components/crm/AddTeamMemberClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team members — NewWheels CRM" };

export default async function TeamPage() {
  await requireTeam("ceo");
  const supabase = getServerSupabase();
  const { data: members } = supabase
    ? await supabase
        .from("team_members")
        .select("id, email, role, display_name, active, created_at, first_logged_in_at")
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Team members</h1>
      <AddTeamMemberClient />
      <div className="crm-card p-0 overflow-x-auto">
        <table className="crm-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr>
          </thead>
          <tbody>
            {(members ?? []).length === 0 ? (
              <tr><td colSpan={6} className="text-sm text-[#6B7280] py-6 text-center">No team members yet — add your first one above.</td></tr>
            ) : (
              (members ?? []).map((m) => (
                <tr key={m.id as string}>
                  <td className="font-semibold">{m.display_name as string}</td>
                  <td>{m.email as string}</td>
                  <td><span className="crm-pill crm-pill-std">{ROLE_LABEL[m.role as keyof typeof ROLE_LABEL]}</span></td>
                  <td>{m.active ? <span className="crm-pill crm-pill-hot">Active</span> : <span className="crm-pill crm-pill-exp">Disabled</span>}</td>
                  <td className="text-xs text-[#6B7280]">{new Date(m.created_at as string).toLocaleDateString("en-CA")}</td>
                  <td>
                    <form action={`/api/crm/team/${m.id}/toggle`} method="post">
                      <button type="submit" className="text-sm underline text-[#0A2818]">
                        {m.active ? "Deactivate" : "Activate"}
                      </button>
                    </form>
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
