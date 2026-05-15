// GA4 Data API wrapper.
//
// Reads from the Analytics Data API v1beta:
//   https://developers.google.com/analytics/devguides/reporting/data/v1
// Requires the service account to be added to the GA4 property as a
// Viewer (Admin → Property access management).

import { google } from "googleapis";
import { googleAuthStatus, googleJwt } from "./auth";

const SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"];

export type GaRow = {
  page: string;
  sessions: number;
  engagedSessions: number;
  conversions: number;
};

export type GaReport = {
  ok: true;
  rows: GaRow[];
  totals: { sessions: number; engagedSessions: number; conversions: number };
};

export type GaError = { ok: false; reason: string };

export function ga4ConfigStatus(): {
  configured: boolean;
  reason?: "missing-credentials" | "missing-property";
} {
  const auth = googleAuthStatus();
  if (!auth.configured) return { configured: false, reason: "missing-credentials" };
  const property = process.env.GA4_PROPERTY_ID?.trim();
  if (!property) return { configured: false, reason: "missing-property" };
  return { configured: true };
}

export async function ga4Report(opts: {
  startDate: string;
  endDate: string;
  rowLimit?: number;
}): Promise<GaReport | GaError> {
  const status = ga4ConfigStatus();
  if (!status.configured) return { ok: false, reason: status.reason ?? "not-configured" };
  const auth = googleJwt(SCOPES);
  if (!auth) return { ok: false, reason: "auth-failed" };

  const propertyId = process.env.GA4_PROPERTY_ID!.trim();
  const data = google.analyticsdata({ version: "v1beta", auth });
  try {
    const resp = await data.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: opts.startDate, endDate: opts.endDate }],
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "sessions" },
          { name: "engagedSessions" },
          { name: "conversions" },
        ],
        orderBys: [{ desc: true, metric: { metricName: "sessions" } }],
        limit: String(opts.rowLimit ?? 25),
      },
    });

    const rows: GaRow[] = (resp.data.rows ?? []).map(r => ({
      page: r.dimensionValues?.[0]?.value ?? "",
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
      engagedSessions: Number(r.metricValues?.[1]?.value ?? 0),
      conversions: Number(r.metricValues?.[2]?.value ?? 0),
    }));
    const totals = rows.reduce(
      (acc, r) => ({
        sessions: acc.sessions + r.sessions,
        engagedSessions: acc.engagedSessions + r.engagedSessions,
        conversions: acc.conversions + r.conversions,
      }),
      { sessions: 0, engagedSessions: 0, conversions: 0 },
    );
    return { ok: true, rows, totals };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}
