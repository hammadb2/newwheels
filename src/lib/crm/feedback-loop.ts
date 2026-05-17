// Dealer close rate feedback loop.
//
// 7 days after a lead is purchased, fires an email to the buyer with
// three one-click buttons: Sold, Test Drive, No Contact.
// Responses recorded against the lead in the CRM.

import { getServerSupabase } from "./supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { EMAIL_BRAND as B, systemEmailWrapper } from "@/lib/email/wrapper";

function feedbackButton(url: string, label: string, color: string): string {
  return `<td style="padding:0 8px;">
    <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#fff;background-color:${color};text-decoration:none;border-radius:8px;text-align:center;min-width:120px;">
      ${label}
    </a>
  </td>`;
}

export async function processFeedbackEmails(): Promise<{ sent: number }> {
  const supabase = getServerSupabase();
  if (!supabase) return { sent: 0 };

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const windowStart = new Date(sevenDaysAgo.getTime() - 12 * 60 * 60 * 1000);
  const windowEnd = new Date(sevenDaysAgo.getTime() + 12 * 60 * 60 * 1000);

  const { data: purchases } = await supabase
    .from("purchases")
    .select("id, lead_id, buyer_id, purchased_at")
    .eq("status", "paid")
    .gte("purchased_at", windowStart.toISOString())
    .lt("purchased_at", windowEnd.toISOString());

  let sent = 0;
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://newwheels.ca").replace(/\/$/, "");

  for (const purchase of purchases ?? []) {
    // Check if feedback already sent
    const { count } = await supabase
      .from("purchase_feedback")
      .select("id", { count: "exact", head: true })
      .eq("purchase_id", purchase.id as string);

    if ((count ?? 0) > 0) continue;

    // Get buyer email
    const { data: buyer } = await supabase
      .from("buyer_accounts")
      .select("email, contact_name")
      .eq("id", purchase.buyer_id as string)
      .single();

    if (!buyer) continue;

    const feedbackUrl = `${baseUrl}/api/feedback/${purchase.id as string}`;

    const body = `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
        Quick question about your recent lead
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:${B.ink};line-height:1.6;">
        Hi ${buyer.contact_name as string} — it&rsquo;s been a week since your lead purchase.
        How did it go? One click, no login required.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          ${feedbackButton(`${feedbackUrl}?outcome=sold`, "Sold", "#16a34a")}
          ${feedbackButton(`${feedbackUrl}?outcome=test_drive`, "Test Drive", "#2563eb")}
          ${feedbackButton(`${feedbackUrl}?outcome=no_contact`, "No Contact", "#dc2626")}
        </tr>
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:${B.muted};">
        This helps us improve lead quality for you.
      </p>
    `;

    await sendEmail({
      to: buyer.email as string,
      subject: "Quick question about your recent lead",
      html: systemEmailWrapper(body),
      tags: [{ name: "type", value: "feedback_request" }],
    });

    // Record that we sent the email
    await supabase.from("purchase_feedback").insert({
      purchase_id: purchase.id,
      lead_id: purchase.lead_id,
      buyer_id: purchase.buyer_id,
      email_sent_at: new Date().toISOString(),
    });

    sent++;
  }

  return { sent };
}
