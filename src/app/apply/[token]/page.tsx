// apply.newwheels.ca/<token> — applicant portal.
//
// If the lead has NOT been qualified yet, shows the multi-step qualification
// form (Canada Drives style). Once qualified, shows status + document upload.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getApplicantStatus, isProbablyToken } from "@/lib/crm/leads/apply";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { SITE_URL } from "@/lib/site";
import { ApplyTokenClient } from "./ApplyTokenClient";

export const metadata: Metadata = {
  title: "Your NewWheels application",
  description: "Track your NewWheels vehicle financing application.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function ApplyTokenPage({ params }: Props) {
  const { token } = await params;
  if (!isProbablyToken(token)) notFound();

  const status = await getApplicantStatus(token);
  if (!status) notFound();

  // Check if qualification already exists
  const supabase = getServerSupabase();
  let isQualified = false;
  if (supabase) {
    const { data: qual } = await supabase
      .from("lead_qualifications")
      .select("id")
      .eq("lead_id", status.lead_id)
      .maybeSingle();
    isQualified = Boolean(qual);
  }

  return (
    <ApplyTokenClient
      token={token}
      status={status}
      isQualified={isQualified}
      siteUrl={SITE_URL}
    />
  );
}
