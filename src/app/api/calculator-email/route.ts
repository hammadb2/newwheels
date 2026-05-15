import { NextResponse } from "next/server";
import { SITE_NAME } from "@/lib/site";
import { scenarioEmail } from "@/lib/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ScenarioPayload = {
  id: number;
  price: number;
  rate: number;
  term: number;
  downPayment: number;
  tradeIn: number;
  owingOnTrade: number;
  gstAmount: number;
  negativeEquity: number;
  tradeEquity: number;
  financed: number;
  monthly: number;
  biweekly: number;
  totalPayments: number;
  costOfBorrowing: number;
};

function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function isValidScenario(s: unknown): s is ScenarioPayload {
  if (!s || typeof s !== "object") return false;
  const o = s as Record<string, unknown>;
  const numFields = [
    "id", "price", "rate", "term", "downPayment", "tradeIn",
    "owingOnTrade", "gstAmount", "negativeEquity", "tradeEquity",
    "financed", "monthly", "biweekly", "totalPayments", "costOfBorrowing",
  ];
  return numFields.every(f => typeof o[f] === "number" && isFinite(o[f] as number));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, scenarios, freq } = body as { email?: string; scenarios?: unknown[]; freq?: string };
    const validFreq = freq === "monthly" ? "monthly" as const : "biweekly" as const;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    if (!Array.isArray(scenarios) || scenarios.length === 0 || scenarios.length > 5) {
      return NextResponse.json({ error: "1-5 scenarios required" }, { status: 400 });
    }

    if (!scenarios.every(isValidScenario)) {
      return NextResponse.json({ error: "Invalid scenario data" }, { status: 400 });
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "Email not configured" }, { status: 500 });
    }

    const subject =
      scenarios.length === 1
        ? `Your ${SITE_NAME} loan estimate`
        : `Your ${scenarios.length} ${SITE_NAME} loan scenarios`;

    const html = scenarioEmail(scenarios, validFreq);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        from: `${SITE_NAME} <hello@newwheels.ca>`,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Resend error:", res.status, text);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
