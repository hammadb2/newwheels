// Server-side Anthropic (Claude) wrapper used by the content pipeline at
// `/admin/content`. Lazy-initialised so the module imports cleanly even
// when the key is absent (the admin UI then renders an empty state instead
// of crashing the route).
//
// We use the Messages API (https://docs.anthropic.com/claude/reference/messages_post)
// because it's the only one supported across current Claude model families.
// The model name is configurable via env (`ANTHROPIC_MODEL`) so we can move
// the pipeline forward without code edits.

import Anthropic from "@anthropic-ai/sdk";

type ClientStatus =
  | { configured: true; client: Anthropic; model: string }
  | { configured: false; reason: "missing-key" };

let cached: ClientStatus | null = null;

export function anthropicClient(): ClientStatus {
  if (cached) return cached;
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    cached = { configured: false, reason: "missing-key" };
    return cached;
  }
  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5";
  cached = { configured: true, client: new Anthropic({ apiKey: key }), model };
  return cached;
}

export function anthropicConfigStatus(): { configured: boolean; reason?: string } {
  const c = anthropicClient();
  return c.configured ? { configured: true } : { configured: false, reason: c.reason };
}

/** Strict JSON-mode helper. Forces Claude to reply with a single JSON object. */
export async function callClaudeJSON<T>(opts: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const c = anthropicClient();
  if (!c.configured) return { ok: false, error: "ANTHROPIC_API_KEY is not configured." };

  const resp = await c.client.messages.create({
    model: c.model,
    max_tokens: opts.maxTokens ?? 4096,
    system: opts.system,
    messages: [
      {
        role: "user",
        content: opts.prompt,
      },
    ],
  });

  const block = resp.content.find(b => b.type === "text");
  if (!block || block.type !== "text") {
    return { ok: false, error: "Claude returned no text content." };
  }

  const text = block.text.trim();
  // Try to parse the response as JSON. We accept either a raw JSON document
  // or a JSON fence (```json ... ```) since Claude commonly emits both.
  const json = extractJson(text);
  if (!json) return { ok: false, error: `Claude response was not valid JSON. Got: ${text.slice(0, 200)}` };
  try {
    return { ok: true, data: JSON.parse(json) as T };
  } catch (e) {
    return { ok: false, error: `JSON parse failed: ${(e as Error).message}` };
  }
}

function extractJson(text: string): string | null {
  // Strip a ```json fence if present.
  const fenced = /```(?:json)?\s*([\s\S]+?)```/.exec(text);
  if (fenced) return fenced[1].trim();
  // Find the first {...} or [...] block.
  const firstObj = text.indexOf("{");
  const firstArr = text.indexOf("[");
  const start =
    firstObj === -1
      ? firstArr
      : firstArr === -1
        ? firstObj
        : Math.min(firstObj, firstArr);
  if (start === -1) return null;
  const lastObj = text.lastIndexOf("}");
  const lastArr = text.lastIndexOf("]");
  const end = Math.max(lastObj, lastArr);
  if (end <= start) return null;
  return text.slice(start, end + 1);
}
