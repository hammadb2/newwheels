// /admin/seo — SEO dashboard reading directly from Search Console + GA4.
//
// No third-party SaaS in the loop. The data layer is the same as the source
// of truth (Google itself). If credentials are absent, we render an empty
// state explaining what to set.

import { requireAdmin } from "@/lib/admin-auth";
import { gscConfigStatus, gscReport, type GscRow } from "@/lib/google/search-console";
import { ga4ConfigStatus, ga4Report, type GaRow } from "@/lib/google/ga4";
import { adminRuntime } from "@/lib/admin-paths";
import { RuntimeBanner } from "@/components/admin/RuntimeBanner";

export const dynamic = "force-dynamic";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function lastNDays(n: number): { startDate: string; endDate: string } {
  const end = new Date();
  // GSC delays by ~2 days, so default lookback ends 2 days ago.
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - n);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

export default async function SeoDashboard() {
  await requireAdmin();
  const gscStatus = gscConfigStatus();
  const gaStatus = ga4ConfigStatus();
  const range = lastNDays(28);

  const [gsc, ga] = await Promise.all([
    gscStatus.configured
      ? gscReport({ ...range, rowLimit: 25 })
      : Promise.resolve({ ok: false as const, reason: gscStatus.reason ?? "not-configured" }),
    gaStatus.configured
      ? ga4Report({ ...range, rowLimit: 25 })
      : Promise.resolve({ ok: false as const, reason: gaStatus.reason ?? "not-configured" }),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-extrabold uppercase">SEO dashboard</h1>
        <p className="mt-2 text-sm text-brand-ink/70">
          Pulled directly from Search Console and GA4. Last 28 days
          ({range.startDate} → {range.endDate}).
        </p>
      </header>

      <RuntimeBanner runtime={adminRuntime()} />

      <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-brand-line">
        <h2 className="text-base font-bold uppercase">Search Console — top queries</h2>
        {!gsc.ok ? (
          <EmptyState
            kind="gsc"
            reason={gsc.reason}
          />
        ) : (
          <>
            <p className="mt-2 text-xs text-brand-ink/55">
              Totals: <strong>{gsc.totals.clicks}</strong> clicks ·{" "}
              <strong>{gsc.totals.impressions}</strong> impressions
            </p>
            <TableQuery rows={gsc.byQuery} />
            <h3 className="mt-8 text-sm font-bold uppercase">Top pages</h3>
            <TablePage rows={gsc.byPage} />
          </>
        )}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-brand-line">
        <h2 className="text-base font-bold uppercase">GA4 — top pages by sessions</h2>
        {!ga.ok ? (
          <EmptyState kind="ga4" reason={ga.reason} />
        ) : (
          <>
            <p className="mt-2 text-xs text-brand-ink/55">
              Totals: <strong>{ga.totals.sessions}</strong> sessions ·{" "}
              <strong>{ga.totals.engagedSessions}</strong> engaged ·{" "}
              <strong>{ga.totals.conversions}</strong> conversions
            </p>
            <TableGa rows={ga.rows} />
          </>
        )}
      </section>
    </div>
  );
}

function TableQuery({ rows }: { rows: GscRow[] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="border-b border-brand-line text-left text-[10px] uppercase text-brand-ink/55">
            <th className="py-2 pr-3">Query</th>
            <th className="py-2 pr-3">Clicks</th>
            <th className="py-2 pr-3">Impr</th>
            <th className="py-2 pr-3">CTR</th>
            <th className="py-2 pr-3">Pos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.key} className="border-b border-brand-line/60">
              <td className="py-2 pr-3">{r.key}</td>
              <td className="py-2 pr-3">{r.clicks}</td>
              <td className="py-2 pr-3">{r.impressions}</td>
              <td className="py-2 pr-3">{(r.ctr * 100).toFixed(1)}%</td>
              <td className="py-2 pr-3">{r.position.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TablePage({ rows }: { rows: GscRow[] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="border-b border-brand-line text-left text-[10px] uppercase text-brand-ink/55">
            <th className="py-2 pr-3">Page</th>
            <th className="py-2 pr-3">Clicks</th>
            <th className="py-2 pr-3">Impr</th>
            <th className="py-2 pr-3">CTR</th>
            <th className="py-2 pr-3">Pos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.key} className="border-b border-brand-line/60">
              <td className="py-2 pr-3 font-mono">{r.key}</td>
              <td className="py-2 pr-3">{r.clicks}</td>
              <td className="py-2 pr-3">{r.impressions}</td>
              <td className="py-2 pr-3">{(r.ctr * 100).toFixed(1)}%</td>
              <td className="py-2 pr-3">{r.position.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableGa({ rows }: { rows: GaRow[] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="border-b border-brand-line text-left text-[10px] uppercase text-brand-ink/55">
            <th className="py-2 pr-3">Page</th>
            <th className="py-2 pr-3">Sessions</th>
            <th className="py-2 pr-3">Engaged</th>
            <th className="py-2 pr-3">Conv</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.page} className="border-b border-brand-line/60">
              <td className="py-2 pr-3 font-mono">{r.page}</td>
              <td className="py-2 pr-3">{r.sessions}</td>
              <td className="py-2 pr-3">{r.engagedSessions}</td>
              <td className="py-2 pr-3">{r.conversions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({
  kind,
  reason,
}: {
  kind: "gsc" | "ga4";
  reason: string;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-brand-line bg-brand-creamSoft p-4 text-xs text-brand-ink/70">
      <p className="font-bold">
        {kind === "gsc" ? "Search Console" : "GA4"} not connected ({reason}).
      </p>
      <p className="mt-2">
        Set <code>GOOGLE_SERVICE_ACCOUNT_JSON</code>,{" "}
        {kind === "gsc" ? (
          <code>GSC_PROPERTY_URL</code>
        ) : (
          <code>GA4_PROPERTY_ID</code>
        )}{" "}
        and add the service account as a user with read access. Then refresh.
      </p>
    </div>
  );
}
