// /admin/gbp — Google Business Profile sync panel.
//
// Pulls reviews and Q&A directly from the GBP API and writes them to
// `data/gbp-cache.json`. The sitewide LocalBusiness + Review schema reads
// from that cache at build/render time, so a refresh here cascades into
// real schema.org Review markup across every page.

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import {
  gbpConfigStatus,
  readGbpCache,
  refreshGbpCache,
  type GbpCache,
} from "@/lib/google/gbp";
import { adminRuntime } from "@/lib/admin-paths";
import { RuntimeBanner } from "@/components/admin/RuntimeBanner";

export const dynamic = "force-dynamic";

async function refreshAction() {
  "use server";
  await requireAdmin();
  await refreshGbpCache();
  revalidatePath("/admin/gbp");
  revalidatePath("/");
}

const STAR_TO_NUM: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

export default async function GbpAdmin() {
  await requireAdmin();
  const status = gbpConfigStatus();
  const cache = await readGbpCache();

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-extrabold uppercase">Google Business Profile</h1>
        <p className="mt-2 text-sm text-brand-ink/70">
          Reviews and Q&amp;A are pulled directly from Google Business Profile and cached at{" "}
          <code>data/gbp-cache.json</code>. The cache feeds the sitewide{" "}
          <code>Review</code> and <code>AggregateRating</code> schema.
        </p>
      </header>

      <RuntimeBanner runtime={adminRuntime()} />

      {!status.configured && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-bold">GBP API not configured ({status.reason}).</p>
          <p className="mt-2">
            Set <code>GOOGLE_SERVICE_ACCOUNT_JSON</code>, <code>GBP_ACCOUNT_ID</code>,
            and <code>GBP_LOCATION_ID</code>. Add the service account as a manager on the
            listing in Google Business Profile, then refresh.
          </p>
        </div>
      )}

      <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-brand-line">
        <header className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-base font-bold uppercase">Cache</h2>
          {status.configured && (
            <form action={refreshAction}>
              <button
                type="submit"
                className="rounded-full bg-brand-forest px-4 py-2 text-xs font-bold uppercase text-white"
              >
                Refresh from GBP
              </button>
            </form>
          )}
        </header>

        {cache ? (
          <CacheSummary cache={cache} />
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-brand-line bg-brand-creamSoft p-4 text-xs text-brand-ink/70">
            No GBP cache on disk yet. Connect the API and click <em>Refresh from GBP</em> to
            populate it. Until then, the site uses the curated seed reviews in{" "}
            <code>SEEDED_REVIEWS</code>.
          </p>
        )}
      </section>

      {cache && cache.reviews.length > 0 && (
        <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-brand-line">
          <h2 className="text-base font-bold uppercase">Reviews ({cache.reviews.length})</h2>
          <ul className="mt-4 space-y-4 text-sm">
            {cache.reviews.map(r => (
              <li key={r.reviewId} className="rounded-2xl border border-brand-line p-4">
                <p className="text-xs text-brand-ink/55">
                  {r.reviewer.displayName} ·{" "}
                  {"★".repeat(STAR_TO_NUM[r.starRating] ?? 0)} ·{" "}
                  {(r.updateTime ?? r.createTime).slice(0, 10)}
                </p>
                <p className="mt-2">{r.comment ?? <em>(no comment)</em>}</p>
                {r.reviewReply && (
                  <p className="mt-3 rounded-xl bg-brand-creamSoft p-3 text-xs text-brand-ink/70">
                    <strong>Reply:</strong> {r.reviewReply.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {cache && cache.questions.length > 0 && (
        <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-brand-line">
          <h2 className="text-base font-bold uppercase">Q&amp;A ({cache.questions.length})</h2>
          <ul className="mt-4 space-y-4 text-sm">
            {cache.questions.map(q => (
              <li key={q.name} className="rounded-2xl border border-brand-line p-4">
                <p className="font-bold">{q.text}</p>
                <p className="text-xs text-brand-ink/55">
                  asked by {q.author.displayName} · {q.createTime.slice(0, 10)} ·{" "}
                  {q.totalAnswerCount ?? 0} answer(s)
                </p>
                {q.topAnswers?.map((a, i) => (
                  <p key={i} className="mt-2 rounded-xl bg-brand-creamSoft p-3 text-xs">
                    <strong>{a.author.displayName}:</strong> {a.text}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function CacheSummary({ cache }: { cache: GbpCache }) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm md:grid-cols-4">
      <div>
        <dt className="text-[10px] uppercase text-brand-ink/55">Last fetched</dt>
        <dd className="font-mono text-xs">{cache.fetchedAt}</dd>
      </div>
      <div>
        <dt className="text-[10px] uppercase text-brand-ink/55">Average rating</dt>
        <dd className="font-bold">{cache.averageRating || "n/a"}</dd>
      </div>
      <div>
        <dt className="text-[10px] uppercase text-brand-ink/55">Reviews</dt>
        <dd className="font-bold">{cache.reviewCount}</dd>
      </div>
      <div>
        <dt className="text-[10px] uppercase text-brand-ink/55">Q&amp;A</dt>
        <dd className="font-bold">{cache.questions.length}</dd>
      </div>
    </dl>
  );
}
