// Google Search Console wrapper used by /admin/seo.
//
// Reads from the Search Analytics API:
//   https://developers.google.com/webmaster-tools/v1/api_reference_index
// Requires the service account to be added as a verified owner of the
// property (`GSC_PROPERTY_URL`).

import { google } from "googleapis";
import { googleAuthStatus, googleJwt } from "./auth";

const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];

export type GscRow = {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number; // 0-1
  position: number;
};

export type GscReport = {
  ok: true;
  byQuery: GscRow[];
  byPage: GscRow[];
  totals: { clicks: number; impressions: number };
};

export type GscError = { ok: false; reason: string };

export function gscConfigStatus(): {
  configured: boolean;
  reason?: "missing-credentials" | "missing-property";
} {
  const auth = googleAuthStatus();
  if (!auth.configured) return { configured: false, reason: "missing-credentials" };
  const property = process.env.GSC_PROPERTY_URL?.trim();
  if (!property) return { configured: false, reason: "missing-property" };
  return { configured: true };
}

export async function gscReport(opts: {
  startDate: string;
  endDate: string;
  rowLimit?: number;
}): Promise<GscReport | GscError> {
  const status = gscConfigStatus();
  if (!status.configured) {
    return { ok: false, reason: status.reason ?? "not-configured" };
  }
  const property = process.env.GSC_PROPERTY_URL!.trim();
  const auth = googleJwt(SCOPES);
  if (!auth) return { ok: false, reason: "auth-failed" };

  const sc = google.searchconsole({ version: "v1", auth });
  try {
    const [byQuery, byPage] = await Promise.all([
      sc.searchanalytics.query({
        siteUrl: property,
        requestBody: {
          startDate: opts.startDate,
          endDate: opts.endDate,
          dimensions: ["query"],
          rowLimit: opts.rowLimit ?? 25,
        },
      }),
      sc.searchanalytics.query({
        siteUrl: property,
        requestBody: {
          startDate: opts.startDate,
          endDate: opts.endDate,
          dimensions: ["page"],
          rowLimit: opts.rowLimit ?? 25,
        },
      }),
    ]);

    const toRows = (rows: { keys?: string[] | null; clicks?: number | null; impressions?: number | null; ctr?: number | null; position?: number | null }[] = []): GscRow[] =>
      rows.map(r => ({
        key: r.keys?.[0] ?? "",
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        ctr: r.ctr ?? 0,
        position: r.position ?? 0,
      }));

    const qRows = toRows(byQuery.data.rows ?? []);
    const pRows = toRows(byPage.data.rows ?? []);
    const totals = qRows.reduce(
      (acc, r) => ({ clicks: acc.clicks + r.clicks, impressions: acc.impressions + r.impressions }),
      { clicks: 0, impressions: 0 },
    );
    return { ok: true, byQuery: qRows, byPage: pRows, totals };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}
