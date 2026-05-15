// /admin/content — Claude-driven content pipeline.
//
// Operator flow:
//   1. Fill in topic + slug + cluster, hit "Generate draft" (server action).
//   2. Server calls Claude with the strict-JSON prompt; result is written to
//      data/drafts/<id>.json.
//   3. Operator reviews the draft below, can delete or publish.
//   4. Publish writes src/content/resources/generated/<slug>.json and deletes
//      the draft. The article is then live the next time `next build` runs
//      (the operator commits + redeploys).
//
// Everything is server-side. No client JS required.

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { anthropicConfigStatus, callClaudeJSON } from "@/lib/anthropic";
import { systemPrompt, userPrompt, type DraftRequest } from "@/lib/content/prompt";
import {
  deleteDraft,
  listDrafts,
  newDraftId,
  readDraft,
  writeDraft,
  type DraftBase,
} from "@/lib/content/drafts";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { GeneratedResourceFile } from "@/lib/content/types";

export const dynamic = "force-dynamic";

const GENERATED_DIR = path.resolve(process.cwd(), "src/content/resources/generated");

type ClaudeResp = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  summary: string;
  body: string;
  faq: { question: string; answer: string }[];
};

async function generateDraftAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const topic = String(formData.get("topic") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const cluster = String(formData.get("cluster") ?? "general").trim() as DraftRequest["cluster"];
  const relatedHref = String(formData.get("relatedHref") ?? "/").trim();
  const relatedLabel = String(formData.get("relatedLabel") ?? "Apply free").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!topic || !slug) return;

  const req: DraftRequest = {
    topic,
    slug,
    cluster,
    relatedCorePage: { href: relatedHref, label: relatedLabel },
    notes: notes || undefined,
  };

  const result = await callClaudeJSON<ClaudeResp>({
    system: systemPrompt(),
    prompt: userPrompt(req),
    maxTokens: 6000,
  });

  const id = newDraftId(slug);
  const base: DraftBase = result.ok
    ? {
        id,
        kind: "resource",
        slug: result.data.slug || slug,
        title: result.data.title,
        shortTitle: result.data.shortTitle,
        description: result.data.description,
        cluster,
        relatedCorePage: req.relatedCorePage,
        summary: result.data.summary,
        body: result.data.body,
        faq: result.data.faq ?? [],
        createdAt: new Date().toISOString(),
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
        prompt: userPrompt(req),
      }
    : {
        id,
        kind: "resource",
        slug,
        title: `(generation failed) ${topic}`,
        shortTitle: topic.slice(0, 45),
        description: result.error.slice(0, 160),
        cluster,
        relatedCorePage: req.relatedCorePage,
        summary: result.error,
        body: `Claude generation failed:\n\n${result.error}`,
        faq: [],
        createdAt: new Date().toISOString(),
        model: null,
        prompt: userPrompt(req),
      };
  await writeDraft(base);
  revalidatePath("/admin/content");
}

async function saveDraftAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await readDraft(id);
  if (!existing) return;

  existing.title = String(formData.get("title") ?? existing.title);
  existing.shortTitle = String(formData.get("shortTitle") ?? existing.shortTitle);
  existing.description = String(formData.get("description") ?? existing.description);
  existing.summary = String(formData.get("summary") ?? existing.summary);
  existing.body = String(formData.get("body") ?? existing.body);

  const faqRaw = String(formData.get("faq") ?? "[]");
  try {
    existing.faq = JSON.parse(faqRaw);
  } catch {
    // keep existing FAQ if parse fails
  }
  await writeDraft(existing);
  revalidatePath("/admin/content");
}

async function deleteDraftAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await deleteDraft(id);
  revalidatePath("/admin/content");
}

async function publishDraftAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const draft = await readDraft(id);
  if (!draft) return;

  await fs.mkdir(GENERATED_DIR, { recursive: true });

  const file: GeneratedResourceFile = {
    slug: draft.slug,
    title: draft.title,
    shortTitle: draft.shortTitle,
    description: draft.description,
    datePublished: new Date().toISOString().slice(0, 10),
    cluster: draft.cluster === "blog" ? "general" : draft.cluster,
    relatedCorePage: draft.relatedCorePage,
    summary: draft.summary,
    body: draft.body,
    faq: draft.faq,
  };
  const out = path.join(GENERATED_DIR, `${draft.slug}.json`);
  await fs.writeFile(out, JSON.stringify(file, null, 2), "utf8");
  await deleteDraft(id);
  revalidatePath("/admin/content");
}

const CLUSTERS: Array<{ value: DraftRequest["cluster"]; label: string }> = [
  { value: "general", label: "General / process" },
  { value: "bad-credit", label: "Bad credit / rebuilding" },
  { value: "newcomer", label: "Newcomer" },
  { value: "work-permit", label: "Work permit" },
  { value: "process", label: "Buying process" },
];

export default async function ContentPipelinePage() {
  await requireAdmin();
  const anth = anthropicConfigStatus();
  const drafts = await listDrafts();

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-extrabold uppercase">Content pipeline</h1>
        <p className="mt-2 text-sm text-brand-ink/70">
          Generate, review, edit, and publish Claude-written resource articles. Published
          articles land in <code>src/content/resources/generated/</code> and are picked up
          the next time the site builds.
        </p>
      </header>

      {!anth.configured && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-bold">ANTHROPIC_API_KEY is not set.</p>
          <p className="mt-2">
            Generation will fail until you provide a key. Edit + publish still work on any
            drafts that already exist in <code>data/drafts/</code>.
          </p>
        </div>
      )}

      <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-brand-line">
        <h2 className="text-base font-bold uppercase">Generate a draft</h2>
        <form action={generateDraftAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-xs font-semibold text-brand-ink/80">
            Topic / working title
            <input
              name="topic"
              required
              placeholder="How long after bankruptcy can I finance a car in Calgary"
              className="mt-1 block w-full rounded-xl border border-brand-line px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold text-brand-ink/80">
            Slug
            <input
              name="slug"
              required
              placeholder="how-long-after-bankruptcy-car-loan-calgary"
              className="mt-1 block w-full rounded-xl border border-brand-line px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold text-brand-ink/80">
            Cluster
            <select
              name="cluster"
              className="mt-1 block w-full rounded-xl border border-brand-line px-3 py-2 text-sm font-normal"
            >
              {CLUSTERS.map(c => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-brand-ink/80">
            Related core page label
            <input
              name="relatedLabel"
              defaultValue="Apply free"
              className="mt-1 block w-full rounded-xl border border-brand-line px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold text-brand-ink/80 md:col-span-2">
            Related core page href
            <input
              name="relatedHref"
              defaultValue="/"
              className="mt-1 block w-full rounded-xl border border-brand-line px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold text-brand-ink/80 md:col-span-2">
            Notes (optional, fed to Claude)
            <textarea
              name="notes"
              rows={3}
              placeholder="Any specific angle, must-cover questions, or Calgary nuance you want emphasised."
              className="mt-1 block w-full rounded-xl border border-brand-line px-3 py-2 text-sm font-normal"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!anth.configured}
              className="rounded-full bg-brand-forest px-5 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-40"
            >
              Generate draft with Claude
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-bold uppercase">
            Drafts ({drafts.length})
          </h2>
          <p className="text-xs text-brand-ink/55">
            Drafts live as JSON in <code>data/drafts/</code>. Commit them or download them
            before redeploying.
          </p>
        </div>

        {drafts.length === 0 && (
          <p className="mt-6 rounded-3xl border border-dashed border-brand-line bg-white p-6 text-sm text-brand-ink/60">
            No drafts yet. Generate one above.
          </p>
        )}

        <div className="mt-6 space-y-8">
          {drafts.map(d => (
            <DraftEditor
              key={d.id}
              draft={d}
              onSave={saveDraftAction}
              onDelete={deleteDraftAction}
              onPublish={publishDraftAction}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function DraftEditor({
  draft,
  onSave,
  onDelete,
  onPublish,
}: {
  draft: DraftBase;
  onSave: (fd: FormData) => Promise<void>;
  onDelete: (fd: FormData) => Promise<void>;
  onPublish: (fd: FormData) => Promise<void>;
}) {
  return (
    <article className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-brand-line">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-brand-ink/55">
            {draft.cluster} · {draft.kind}
          </p>
          <h3 className="mt-1 text-lg font-bold">{draft.title}</h3>
          <p className="mt-1 text-xs text-brand-ink/55">
            /resources/{draft.slug} · created {draft.createdAt} · model {draft.model ?? "n/a"}
          </p>
        </div>
        <form action={onPublish}>
          <input type="hidden" name="id" value={draft.id} />
          <button
            type="submit"
            className="rounded-full bg-brand-forest px-4 py-2 text-xs font-bold uppercase text-white"
          >
            Publish
          </button>
        </form>
      </header>

      <form action={onSave} className="mt-6 grid gap-3">
        <input type="hidden" name="id" value={draft.id} />
        <label className="text-xs font-semibold text-brand-ink/80">
          Title
          <input
            name="title"
            defaultValue={draft.title}
            className="mt-1 block w-full rounded-xl border border-brand-line px-3 py-2 text-sm font-normal"
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-semibold text-brand-ink/80">
            Short title
            <input
              name="shortTitle"
              defaultValue={draft.shortTitle}
              className="mt-1 block w-full rounded-xl border border-brand-line px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold text-brand-ink/80">
            Description (meta)
            <input
              name="description"
              defaultValue={draft.description}
              className="mt-1 block w-full rounded-xl border border-brand-line px-3 py-2 text-sm font-normal"
            />
          </label>
        </div>
        <label className="text-xs font-semibold text-brand-ink/80">
          Summary (40-60 word answer-first paragraph)
          <textarea
            name="summary"
            rows={3}
            defaultValue={draft.summary}
            className="mt-1 block w-full rounded-xl border border-brand-line px-3 py-2 text-sm font-normal"
          />
        </label>
        <label className="text-xs font-semibold text-brand-ink/80">
          Body (markdown)
          <textarea
            name="body"
            rows={20}
            defaultValue={draft.body}
            className="mt-1 block w-full rounded-xl border border-brand-line px-3 py-2 font-mono text-xs font-normal"
          />
        </label>
        <label className="text-xs font-semibold text-brand-ink/80">
          FAQ (JSON array of <code>{`{question, answer}`}</code>)
          <textarea
            name="faq"
            rows={10}
            defaultValue={JSON.stringify(draft.faq, null, 2)}
            className="mt-1 block w-full rounded-xl border border-brand-line px-3 py-2 font-mono text-xs font-normal"
          />
        </label>
        <div className="flex justify-between">
          <button
            type="submit"
            className="rounded-full bg-brand-ink px-4 py-2 text-xs font-bold uppercase text-white"
          >
            Save edits
          </button>
        </div>
      </form>

      <form action={onDelete} className="mt-3">
        <input type="hidden" name="id" value={draft.id} />
        <button
          type="submit"
          className="text-xs font-semibold text-red-600 underline"
        >
          Delete draft
        </button>
      </form>
    </article>
  );
}
