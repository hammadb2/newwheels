// Flat-file draft store.
//
// The user explicitly does not want a database or external orchestration
// tool, so we keep generated content drafts as JSON files in the repo under
// `data/drafts/`. Each file is a single draft. The dev/operator can review,
// edit, and either delete it or "publish" by committing it forward to a
// real content file (the publish step is performed by the admin UI's
// /api/admin/publish-resource handler, which writes a TSX article file into
// `src/content/resources/generated/` and updates the article index).
//
// On Vercel's serverless runtime the project filesystem is read-only, so
// the path resolves to `/tmp/newwheels-data/drafts/` instead. Writes work
// for the lifetime of the function instance but are lost on cold start.
// See `src/lib/admin-paths.ts` for the routing.

import { promises as fs } from "node:fs";
import path from "node:path";
import {
  draftsDir,
  safeMkdir,
  safeUnlink,
  safeWriteFile,
} from "@/lib/admin-paths";

export type DraftKind = "resource" | "blog";

export type DraftBase = {
  id: string; // YYYYMMDD-HHMMSS-slug
  kind: DraftKind;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  cluster:
    | "bad-credit"
    | "newcomer"
    | "work-permit"
    | "process"
    | "general"
    | "blog";
  relatedCorePage: { href: string; label: string };
  summary: string;
  body: string; // Plain markdown — converted to TSX on publish.
  faq: { question: string; answer: string }[];
  // Provenance
  createdAt: string;
  model: string | null;
  prompt: string;
};

function safeFileName(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export async function ensureDraftDir(): Promise<boolean> {
  return safeMkdir(draftsDir());
}

export async function listDrafts(): Promise<DraftBase[]> {
  await ensureDraftDir();
  const dir = draftsDir();
  const files = await fs.readdir(dir).catch(() => [] as string[]);
  const drafts: DraftBase[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(dir, f), "utf8");
      drafts.push(JSON.parse(raw) as DraftBase);
    } catch {
      // Skip malformed files.
    }
  }
  drafts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return drafts;
}

export async function readDraft(id: string): Promise<DraftBase | null> {
  await ensureDraftDir();
  const file = path.join(draftsDir(), `${safeFileName(id)}.json`);
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as DraftBase;
  } catch {
    return null;
  }
}

export async function writeDraft(draft: DraftBase): Promise<boolean> {
  await ensureDraftDir();
  const file = path.join(draftsDir(), `${safeFileName(draft.id)}.json`);
  return safeWriteFile(file, JSON.stringify(draft, null, 2));
}

export async function deleteDraft(id: string): Promise<void> {
  await ensureDraftDir();
  const file = path.join(draftsDir(), `${safeFileName(id)}.json`);
  await safeUnlink(file);
}

/**
 * Create a unique draft id of the form `YYYYMMDD-HHMMSS-<slug>`.
 */
export function newDraftId(slug: string): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const ts =
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}-` +
    `${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;
  return safeFileName(`${ts}-${slug}`);
}
