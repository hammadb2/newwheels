// /portal — buyer landing. Redirects appropriately based on auth + status.

import { redirect } from "next/navigation";
import { readSession } from "@/lib/crm/auth/session";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const dynamic = "force-dynamic";

export default async function PortalRootPage() {
  const session = await readSession("portal");
  if (!session || session.subject.kind !== "buyer") {
    redirect("/portal/login");
  }
  const supabase = getServerSupabase();
  if (!supabase) redirect("/portal/login");
  const { data } = await supabase
    .from("buyer_accounts")
    .select("status")
    .eq("id", session.subject.buyer_account_id)
    .single();
  if (data?.status !== "active") {
    redirect("/portal/pending");
  }
  redirect("/portal/marketplace");
}
