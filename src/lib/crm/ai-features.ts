// Advanced AI features — Claude API integration layer.
//
// Natural language search, weekly CEO briefing, conversation intelligence,
// buyer behavior intelligence, and competitive intelligence.
//
// All features gracefully no-op when ANTHROPIC_API_KEY is not set.

import { getServerSupabase } from "./supabase/server";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

async function callClaude(prompt: string, systemPrompt?: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const messages = [{ role: "user" as const, content: prompt }];
    const body: Record<string, unknown> = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages,
    };
    if (systemPrompt) body.system = systemPrompt;

    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { content?: { text?: string }[] };
    return data.content?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

// Natural language search — CEO types plain English, Claude converts to filter.
export async function naturalLanguageSearch(query: string): Promise<{
  results: Record<string, unknown>[];
  interpretation: string | null;
}> {
  const supabase = getServerSupabase();
  if (!supabase) return { results: [], interpretation: null };

  const interpretation = await callClaude(
    `Convert this natural language query about leads into a JSON filter object.
The database has these columns: first_name, last_name, email, phone, status (received/qualification_in_progress/qualification_complete/available/sold/expired), tier (hot/warm/standard), score (0-100), created_at, city, province.

Query: "${query}"

Return ONLY a JSON object with these optional fields:
- status: string
- tier: string
- score_min: number
- score_max: number
- search: string (for name/email text search)
- days_ago: number (for created_at filter)

Example: { "tier": "hot", "score_min": 80 }`,
    "You are a query parser. Return only valid JSON, no explanation.",
  );

  let filter: Record<string, unknown> = {};
  if (interpretation) {
    try {
      filter = JSON.parse(interpretation);
    } catch { /* use empty filter */ }
  }

  let query_builder = supabase.from("leads").select("id, first_name, last_name, email, status, tier, score, created_at").limit(50);

  if (filter.status) query_builder = query_builder.eq("status", filter.status as string);
  if (filter.tier) query_builder = query_builder.eq("tier", filter.tier as string);
  if (filter.score_min) query_builder = query_builder.gte("score", filter.score_min as number);
  if (filter.score_max) query_builder = query_builder.lte("score", filter.score_max as number);
  if (filter.search) {
    const s = filter.search as string;
    query_builder = query_builder.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%`);
  }
  if (filter.days_ago) {
    const since = new Date(Date.now() - (filter.days_ago as number) * 24 * 60 * 60 * 1000);
    query_builder = query_builder.gte("created_at", since.toISOString());
  }

  const { data } = await query_builder.order("created_at", { ascending: false });

  return { results: (data ?? []) as Record<string, unknown>[], interpretation };
}

// Weekly CEO briefing — Monday morning narrative email.
export async function generateWeeklyBriefing(): Promise<string | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [leadsRes, purchasesRes, feedbackRes] = await Promise.all([
    supabase.from("leads").select("id, status, tier, score").gte("created_at", weekAgo.toISOString()),
    supabase.from("purchases").select("id, amount_cents, buyer_id").eq("status", "paid").gte("purchased_at", weekAgo.toISOString()),
    supabase.from("purchase_feedback").select("outcome").not("outcome", "is", null).gte("responded_at", weekAgo.toISOString()),
  ]);

  const leads = leadsRes.data ?? [];
  const purchases = purchasesRes.data ?? [];
  const feedback = feedbackRes.data ?? [];

  const revenue = purchases.reduce((s, p) => s + (Number(p.amount_cents) || 0), 0);
  const sold = feedback.filter((f) => f.outcome === "sold").length;
  const noContact = feedback.filter((f) => f.outcome === "no_contact").length;

  const stats = {
    new_leads: leads.length,
    hot_leads: leads.filter((l) => l.tier === "hot").length,
    warm_leads: leads.filter((l) => l.tier === "warm").length,
    purchases: purchases.length,
    revenue_dollars: (revenue / 100).toFixed(2),
    feedback_sold: sold,
    feedback_no_contact: noContact,
    avg_score: leads.length > 0
      ? (leads.reduce((s, l) => s + (Number(l.score) || 0), 0) / leads.length).toFixed(0)
      : "0",
  };

  const briefing = await callClaude(
    `Write a concise Monday morning CEO briefing email for NewWheels (Calgary auto financing lead marketplace).

Weekly stats:
${JSON.stringify(stats, null, 2)}

Write 3-4 short paragraphs covering:
1. Revenue and purchase volume
2. Lead quality and pipeline health
3. Buyer engagement (feedback responses)
4. One specific recommended action for this week

Keep it under 250 words. Be direct and data-driven. Use dollar amounts and percentages.`,
    "You are the NewWheels AI assistant writing an internal briefing for the CEO. Be concise and actionable.",
  );

  return briefing;
}

// Conversation intelligence — analyze email reply and surface signal.
export async function analyzeEmailReply(emailBody: string): Promise<string | null> {
  return callClaude(
    `Analyze this email reply from a car loan applicant and return a one-line signal (max 15 words) summarizing their intent or status:

"${emailBody}"

Examples of good signals:
- "Ready to proceed, asking about next steps"
- "Frustrated with wait time, at risk of churning"
- "Providing additional documents as requested"
- "Inquiring about payment terms and interest rates"

Return ONLY the one-line signal, nothing else.`,
    "You are an email analysis tool. Return only the one-line signal.",
  );
}

// Buyer behavior intelligence — detect churn risk from purchase patterns.
export async function detectBuyerChurnRisk(buyerId: string): Promise<{
  at_risk: boolean;
  frequency_drop_pct: number;
  recommendation: string | null;
}> {
  const supabase = getServerSupabase();
  if (!supabase) return { at_risk: false, frequency_drop_pct: 0, recommendation: null };

  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const { count: prevCount } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", buyerId)
    .eq("status", "paid")
    .gte("purchased_at", fourWeeksAgo.toISOString())
    .lt("purchased_at", twoWeeksAgo.toISOString());

  const { count: recentCount } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", buyerId)
    .eq("status", "paid")
    .gte("purchased_at", twoWeeksAgo.toISOString());

  const prev = prevCount ?? 0;
  const recent = recentCount ?? 0;

  if (prev === 0) return { at_risk: false, frequency_drop_pct: 0, recommendation: null };

  const dropPct = ((prev - recent) / prev) * 100;
  const atRisk = dropPct >= 40;

  return {
    at_risk: atRisk,
    frequency_drop_pct: Math.round(dropPct),
    recommendation: atRisk
      ? "Purchase frequency dropped significantly. Consider reaching out to understand if lead quality or pricing concerns exist."
      : null,
  };
}
