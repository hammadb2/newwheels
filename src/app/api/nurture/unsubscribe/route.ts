// GET /api/nurture/unsubscribe?id=<lead_id> — unsubscribe from nurture emails.

import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const leadId = url.searchParams.get("id");

  if (!leadId) {
    return new Response(page("Invalid unsubscribe link."), {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  const supabase = getServerSupabase();
  if (supabase) {
    await supabase
      .from("leads")
      .update({ nurture_unsubscribed: new Date().toISOString() })
      .eq("id", leadId);
  }

  return new Response(page("You have been unsubscribed from NewWheels follow-up emails."), {
    headers: { "Content-Type": "text/html" },
  });
}

function page(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe — NewWheels</title></head>
<body style="margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F5F1E8;text-align:center;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <h1 style="font-size:24px;font-weight:800;color:#0A2818;margin:0 0 12px;">Unsubscribed</h1>
    <p style="font-size:15px;color:#0A2818;line-height:1.6;">${message}</p>
  </div>
</body>
</html>`;
}
