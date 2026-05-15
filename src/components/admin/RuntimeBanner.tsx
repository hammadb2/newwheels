// Sticky banner shown at the top of every admin page when running on a
// read-only filesystem (Vercel serverless). Communicates to the operator
// that writes to `data/` and `src/content/resources/generated/` only land
// in `/tmp` and won't survive a redeploy. The intended workflow remains:
// run admin locally, commit, push, redeploy.

import type { AdminRuntime } from "@/lib/admin-paths";

export function RuntimeBanner({ runtime }: { runtime: AdminRuntime }) {
  if (runtime !== "vercel") return null;
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
      <p className="font-bold">Running on Vercel — writes are ephemeral.</p>
      <p className="mt-2">
        The admin panel works here, but generated drafts, GBP cache refreshes,
        and published article files all land in <code>/tmp/newwheels-data/</code>{" "}
        and disappear on the next cold start.
      </p>
      <p className="mt-2">
        For permanent changes the workflow is still: run <code>npm run dev</code>{" "}
        locally, generate / refresh / publish there, then commit{" "}
        <code>data/</code> + <code>src/content/resources/generated/</code> and
        push.
      </p>
    </div>
  );
}
