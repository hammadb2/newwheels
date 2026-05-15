// Build-time loader for published-from-admin resource articles.
//
// The /admin/content pipeline writes published articles into this directory
// as `<slug>.json` files. At build time we read every JSON in the directory,
// turn each into a `ResourceArticle`, and re-export them. The resource hub
// index + the catchall route then list and render them alongside the
// hand-written articles.
//
// We deliberately read the directory synchronously (this module runs in the
// Node server / build phase only — never on the client) so the loader stays
// dependency-free.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import React from "react";
import type { ResourceArticle } from "../../resources";
import type { GeneratedResourceFile } from "@/lib/content/types";
import { Markdown } from "@/lib/content/markdown";

const GENERATED_DIR = path.resolve(process.cwd(), "src/content/resources/generated");

function loadGenerated(): ResourceArticle[] {
  let files: string[];
  try {
    files = readdirSync(GENERATED_DIR);
  } catch {
    return [];
  }
  const articles: ResourceArticle[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = readFileSync(path.join(GENERATED_DIR, f), "utf8");
      const parsed = JSON.parse(raw) as GeneratedResourceFile;
      articles.push({
        slug: parsed.slug,
        title: parsed.title,
        shortTitle: parsed.shortTitle,
        description: parsed.description,
        datePublished: parsed.datePublished,
        dateModified: parsed.dateModified,
        summary: parsed.summary,
        cluster: parsed.cluster,
        relatedCorePage: parsed.relatedCorePage,
        faq: parsed.faq,
        Body: function GeneratedBody() {
          return React.createElement(Markdown, { source: parsed.body });
        },
      });
    } catch {
      // skip malformed files
    }
  }
  return articles;
}

export const GENERATED_RESOURCE_ARTICLES: ResourceArticle[] = loadGenerated();
