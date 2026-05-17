// GET /api/feedback/:purchaseId?outcome=sold|test_drive|no_contact
//
// One-click feedback from buyer email — no login required.
// Records outcome against the purchase.

import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_OUTCOMES = ["sold", "test_drive", "no_contact"] as const;
type Outcome = (typeof VALID_OUTCOMES)[number];

type Ctx = { params: Promise<{ purchaseId: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { purchaseId } = await ctx.params;
  const url = new URL(req.url);
  const outcome = url.searchParams.get("outcome") as Outcome | null;

  if (!outcome || !VALID_OUTCOMES.includes(outcome)) {
    return new Response(thankYouPage("Invalid response. Please use the link from your email."), {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return new Response(thankYouPage("System unavailable. Please try again later."), {
      headers: { "Content-Type": "text/html" },
      status: 503,
    });
  }

  // Update feedback record
  const { error } = await supabase
    .from("purchase_feedback")
    .update({
      outcome,
      responded_at: new Date().toISOString(),
    })
    .eq("purchase_id", purchaseId)
    .is("outcome", null);

  if (error) {
    // May have already responded
    return new Response(thankYouPage("Thanks — we already have your response on file."), {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Check for 3 consecutive no_contact from same buyer
  if (outcome === "no_contact") {
    const { data: feedback } = await supabase
      .from("purchase_feedback")
      .select("buyer_id")
      .eq("purchase_id", purchaseId)
      .single();

    if (feedback?.buyer_id) {
      const { data: recent } = await supabase
        .from("purchase_feedback")
        .select("outcome")
        .eq("buyer_id", feedback.buyer_id as string)
        .not("outcome", "is", null)
        .order("responded_at", { ascending: false })
        .limit(3);

      if (recent && recent.length >= 3 && recent.every((r) => r.outcome === "no_contact")) {
        // Flag for CEO review
        await supabase.from("lead_audit_log").insert({
          lead_id: null,
          event: "buyer_no_contact_streak",
          detail: {
            buyer_id: feedback.buyer_id,
            consecutive_no_contact: recent.length,
          } as Record<string, unknown>,
        });
      }
    }
  }

  const labels: Record<Outcome, string> = {
    sold: "Great news — glad the lead worked out!",
    test_drive: "Good progress — hope the test drive leads to a sale!",
    no_contact: "Sorry to hear that. We'll look into it.",
  };

  return new Response(thankYouPage(labels[outcome]), {
    headers: { "Content-Type": "text/html" },
  });
}

function thankYouPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NewWheels Feedback</title></head>
<body style="margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F5F1E8;text-align:center;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <h1 style="font-size:24px;font-weight:800;color:#0A2818;margin:0 0 12px;">Thanks for your feedback</h1>
    <p style="font-size:15px;color:#0A2818;line-height:1.6;">${message}</p>
    <p style="margin-top:24px;font-size:13px;color:#6B7280;">You can close this page.</p>
  </div>
</body>
</html>`;
}
