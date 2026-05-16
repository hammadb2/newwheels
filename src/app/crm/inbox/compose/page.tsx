// /crm/inbox/compose — compose a brand-new outbound email.

import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { ComposeClient } from "@/components/crm/ComposeClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compose — NewWheels CRM" };

export default async function ComposePage() {
  const { subject } = await requireTeam("any_team");
  if (subject.kind !== "team") return null;

  const supabase = getServerSupabase();
  let myEmail = "";
  if (supabase) {
    const { data: me } = await supabase
      .from("team_members")
      .select("email")
      .eq("id", subject.team_member_id)
      .single();
    myEmail = (me?.email as string) ?? "";
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Compose</h1>
      <ComposeClient fromEmail={myEmail} />
    </div>
  );
}
