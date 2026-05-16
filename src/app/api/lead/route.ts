import { NextResponse } from "next/server";
import { BUSINESS, SITE_NAME, SITE_URL } from "@/lib/site";
import { autoReplyEmail, notifyEmail } from "@/lib/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadPayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  credit?: string;
  employment?: string;
  visa?: string;
  timeframe?: string;
  notes?: string;
  sourcePage?: string;
};

function required(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

async function sendResend(opts: {
  to: string;
  from: string;
  subject: string;
  html: string;
  reply_to?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { skipped: true as const, reason: "no RESEND_API_KEY" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(opts),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { skipped: false as const, ok: false as const, status: res.status, error: text };
  }
  return { skipped: false as const, ok: true as const };
}

const QUO_SENDER = process.env.QUO_SENDER_NUMBER || "+15879006051";
const QUO_TEAM = process.env.QUO_TEAM_NUMBER || "+15879567479";

function toE164(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

async function sendQuoSms(to: string, content: string) {
  const key = process.env.QUO_API_KEY;
  if (!key) return { skipped: true as const, reason: "no QUO_API_KEY" };
  const res = await fetch("https://api.openphone.com/v1/messages", {
    method: "POST",
    headers: {
      Authorization: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      from: toE164(QUO_SENDER),
      to: [toE164(to)],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { skipped: false as const, ok: false as const, status: res.status, error: text };
  }
  return { skipped: false as const, ok: true as const };
}

async function postToSheet(payload: LeadPayload, timestamp: string) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) return { skipped: true as const };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, timestamp, site: SITE_URL }),
  });
  return { skipped: false as const, ok: res.ok, status: res.status };
}

export async function POST(req: Request) {
  let data: LeadPayload;
  try {
    data = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  for (const k of ["firstName", "lastName", "phone", "email", "credit", "employment", "timeframe"] as const) {
    if (!required(data[k])) {
      return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
    }
  }

  const timestamp = new Date().toISOString();
  const safe = {
    firstName: String(data.firstName).slice(0, 80),
    lastName: String(data.lastName).slice(0, 80),
    phone: String(data.phone).slice(0, 40),
    email: String(data.email).slice(0, 200),
    credit: String(data.credit).slice(0, 80),
    employment: String(data.employment).slice(0, 80),
    visa: String(data.visa || "").slice(0, 120),
    timeframe: String(data.timeframe).slice(0, 80),
    notes: String(data.notes || "").slice(0, 2000),
    sourcePage: String(data.sourcePage || "/").slice(0, 200),
  };
  const fullName = `${safe.firstName} ${safe.lastName}`.trim();

  // Fire all integrations in parallel for sub-60s SLA.
  const from = process.env.LEAD_FROM_EMAIL || `${SITE_NAME} <${BUSINESS.email}>`;
  const notifyTo = process.env.LEAD_NOTIFY_TO || BUSINESS.email;

  const notifyHtml = notifyEmail({
    fullName,
    phone: safe.phone,
    email: safe.email,
    credit: safe.credit,
    employment: safe.employment,
    visa: safe.visa,
    timeframe: safe.timeframe,
    sourcePage: safe.sourcePage,
    notes: safe.notes,
    timestamp,
  });

  const autoReplyHtml = autoReplyEmail(safe.firstName);

  const applicantSms = `Hi ${safe.firstName}, thanks for applying with NewWheels! A specialist will call you within 1 hour during business hours (${BUSINESS.hours}). Questions? Call us: ${BUSINESS.phone}`;

  const teamSms = `New lead: ${fullName}\nPhone: ${safe.phone}\nCredit: ${safe.credit}\nEmployment: ${safe.employment}\nTimeframe: ${safe.timeframe}\nSource: ${safe.sourcePage}`;

  // Fan-out: also forward to the CRM lead-intake pipeline so the lead becomes
  // visible to the Lead Qualifier inside the CRM. This is fire-and-forget — a
  // failure here must NOT break the marketing-site form response.
  let crmForwardResult: { ok: true; lead_id?: string } | { ok: false; error: string } = { ok: false, error: "skipped" };
  try {
    const { intakeLead } = await import("@/lib/crm/leads/intake");
    const crm = await intakeLead({
      first_name: safe.firstName,
      last_name: safe.lastName,
      email: safe.email,
      phone: safe.phone,
      source_page: safe.sourcePage,
      source_channel: null,
      raw_payload: { ...safe, timestamp },
    });
    crmForwardResult = crm.ok
      ? { ok: true, lead_id: crm.lead_id }
      : { ok: false, error: (crm as { ok: false; error?: string }).error ?? "crm_intake_failed" };
  } catch (e) {
    crmForwardResult = { ok: false, error: e instanceof Error ? e.message : "crm_intake_threw" };
  }

  const [notifyResult, autoReplyResult, sheetResult, smsApplicantResult, smsTeamResult] = await Promise.all([
    sendResend({
      to: notifyTo,
      from,
      subject: `New Lead: ${fullName} - ${safe.phone}`,
      html: notifyHtml,
      reply_to: safe.email,
    }),
    sendResend({
      to: safe.email,
      from,
      subject: "We received your application - NewWheels",
      html: autoReplyHtml,
    }),
    postToSheet(safe, timestamp),
    sendQuoSms(safe.phone, applicantSms),
    sendQuoSms(QUO_TEAM, teamSms),
  ]);

  return NextResponse.json({
    ok: true,
    integrations: {
      notify: notifyResult,
      autoReply: autoReplyResult,
      sheet: sheetResult,
      smsApplicant: smsApplicantResult,
      smsTeam: smsTeamResult,
      crm: crmForwardResult,
    },
  });
}
