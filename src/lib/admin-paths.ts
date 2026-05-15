// Filesystem path resolution for the `/admin/*` panel.
//
// Vercel's serverless runtime mounts the function bundle read-only — only
// `/tmp` is writable. To make the admin panel render and write without
// crashing in production we keep two separate roots:
//
//   - Local dev (no VERCEL env): `data/` in the repo. Changes are real and
//     can be committed.
//   - Vercel runtime: `/tmp/newwheels-data/`. Writes succeed but are
//     ephemeral and lost on the next cold start. Used so the operator can
//     exercise the flow end-to-end on a deploy; for permanent changes the
//     workflow is still "run admin locally, commit, push".
//
// We also publish a `runtime` indicator so the admin UI can surface a
// banner explaining the ephemerality.

import path from "node:path";
import { promises as fs } from "node:fs";

export type AdminRuntime = "local" | "vercel";

export function adminRuntime(): AdminRuntime {
  return process.env.VERCEL === "1" || process.env.VERCEL === "true" ? "vercel" : "local";
}

const VERCEL_DATA_ROOT = "/tmp/newwheels-data";

function dataRoot(): string {
  return adminRuntime() === "vercel"
    ? VERCEL_DATA_ROOT
    : path.resolve(process.cwd(), "data");
}

/** Path to the per-runtime drafts directory. */
export function draftsDir(): string {
  return path.join(dataRoot(), "drafts");
}

/** Path to the per-runtime GBP cache JSON. */
export function gbpCachePath(): string {
  return path.join(dataRoot(), "gbp-cache.json");
}

/**
 * Path to the per-runtime published-articles directory.
 *
 * On local dev this is `src/content/resources/generated/`, which is what
 * the resource hub loader reads at build time. On Vercel runtime we redirect
 * to `/tmp` (the write succeeds but doesn't end up in the bundle — the
 * operator has to commit the file manually for it to render).
 */
export function publishedDir(): string {
  return adminRuntime() === "vercel"
    ? path.join(VERCEL_DATA_ROOT, "generated")
    : path.resolve(process.cwd(), "src/content/resources/generated");
}

/**
 * Wrap a directory-creating fs call so an unwritable filesystem doesn't
 * blow up the entire page. Returns true on success, false on failure (with
 * the error logged).
 */
export async function safeMkdir(dir: string): Promise<boolean> {
  try {
    await fs.mkdir(dir, { recursive: true });
    return true;
  } catch (e) {
    console.error(`[admin] mkdir failed for ${dir}:`, (e as Error).message);
    return false;
  }
}

/** Wrap fs.writeFile with the same defensive logging. */
export async function safeWriteFile(file: string, content: string): Promise<boolean> {
  try {
    await fs.writeFile(file, content, "utf8");
    return true;
  } catch (e) {
    console.error(`[admin] writeFile failed for ${file}:`, (e as Error).message);
    return false;
  }
}

/** Wrap fs.unlink so a missing file is a no-op, never an exception. */
export async function safeUnlink(file: string): Promise<void> {
  await fs.unlink(file).catch(() => {});
}
