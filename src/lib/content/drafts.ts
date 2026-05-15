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
// The store lives on the local filesystem (Node fs/promises) — perfect for
// local dev and the Vercel build phase. In production runtime, the writable
// path may be ephemeral, so the admin UI also surfaces a "Download all
// drafts as ZIP" affordance (server action) so the operator can move them
// into the repo locally.

import { promises as fs } from "node:fs";
import path from "node:path";

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

export const DRAFT_DIR = path.resolve(process.cwd(), "data/drafts");

export async function ensureDraftDir(): Promise<void> {
  await fs.mkdir(DRAFT_DIR, { recursive: true });
}

function safeFileName(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export async function listDrafts(): Promise<DraftBase[]> {
  await ensureDraftDir();
  const files = await fs.readdir(DRAFT_DIR).catch(() => []);
  const drafts: DraftBase[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(DRAFT_DIR, f), "utf8");
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
  const file = path.join(DRAFT_DIR, `${safeFileName(id)}.json`);
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as DraftBase;
  } catch {
    return null;
  }
}

export async function writeDraft(draft: DraftBase): Promise<void> {
  await ensureDraftDir();
  const file = path.join(DRAFT_DIR, `${safeFileName(draft.id)}.json`);
  await fs.writeFile(file, JSON.stringify(draft, null, 2), "utf8");
}

export async function deleteDraft(id: string): Promise<void> {
  await ensureDraftDir();
  const file = path.join(DRAFT_DIR, `${safeFileName(id)}.json`);
  await fs.unlink(file).catch(() => {});
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
