// /crm/content — Content & SEO content task queue.

import { requireTeam } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { ContentTaskClient } from "@/components/crm/ContentTaskClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Content queue — NewWheels CRM" };

type Task = {
  id: string;
  task_kind: string;
  title: string;
  status: string;
  scheduled_for: string | null;
  completed_at: string | null;
  notes: string | null;
};

export default async function ContentQueuePage() {
  const { subject } = await requireTeam("content_seo");
  const supabase = getServerSupabase();
  let tasks: Task[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("content_tasks")
      .select("id, task_kind, title, status, scheduled_for, completed_at, notes")
      .eq("team_member_id", subject.team_member_id)
      .order("status", { ascending: true })
      .order("scheduled_for", { ascending: true })
      .limit(200);
    tasks = (data ?? []) as Task[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2818]">Content queue</h1>
        <p className="text-sm text-[#6B7280] mt-1">Blog posts, GBP posts, copy changes, and directory submissions.</p>
      </div>

      <ContentTaskClient tasks={tasks} />
    </div>
  );
}
