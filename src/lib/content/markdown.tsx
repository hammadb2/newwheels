// Tiny markdown renderer used by Claude-generated articles.
//
// The content pipeline returns the body of an article as plain Markdown
// (Claude is reliable at this format). To keep the runtime dependency
// surface minimal we do not pull in a third-party parser — instead we
// implement a fragment-only renderer that covers exactly what our resource
// articles need:
//   - h2/h3 headings
//   - paragraphs
//   - unordered + ordered lists
//   - bold (**) and italic (*) inline
//   - inline links [label](href)
//
// Anything more exotic (tables, code fences, images, headings beyond h3) is
// rendered as plain text. This keeps generated content safe and on-brand.

import React from "react";

type Block =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] };

function parse(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let buf: string[] = [];
  let listKind: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushPara = () => {
    if (buf.length === 0) return;
    const text = buf.join(" ").trim();
    if (text.length) blocks.push({ kind: "p", text });
    buf = [];
  };
  const flushList = () => {
    if (!listKind || listItems.length === 0) {
      listKind = null;
      listItems = [];
      return;
    }
    blocks.push({ kind: listKind, items: listItems });
    listKind = null;
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/g, "");
    if (line.trim() === "") {
      flushPara();
      flushList();
      continue;
    }
    if (/^###\s+/.test(line)) {
      flushPara();
      flushList();
      blocks.push({ kind: "h3", text: line.replace(/^###\s+/, "") });
      continue;
    }
    if (/^##\s+/.test(line)) {
      flushPara();
      flushList();
      blocks.push({ kind: "h2", text: line.replace(/^##\s+/, "") });
      continue;
    }
    const ul = /^\s*[-*]\s+(.+)$/.exec(line);
    if (ul) {
      flushPara();
      if (listKind !== "ul") flushList();
      listKind = "ul";
      listItems.push(ul[1]);
      continue;
    }
    const ol = /^\s*\d+\.\s+(.+)$/.exec(line);
    if (ol) {
      flushPara();
      if (listKind !== "ol") flushList();
      listKind = "ol";
      listItems.push(ol[1]);
      continue;
    }
    if (listKind) {
      // Continuation of a list item — append to the last item.
      listItems[listItems.length - 1] += " " + line.trim();
      continue;
    }
    buf.push(line);
  }
  flushPara();
  flushList();
  return blocks;
}

function renderInline(text: string, baseKey: string): React.ReactNode[] {
  // Tokenize for **bold**, *italic*, and [label](url).
  const tokens: React.ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      tokens.push(text.slice(lastIndex, m.index));
    }
    const key = `${baseKey}-${idx++}`;
    if (m[2]) {
      tokens.push(<strong key={key}>{m[2]}</strong>);
    } else if (m[3]) {
      tokens.push(<em key={key}>{m[3]}</em>);
    } else if (m[4] && m[5]) {
      tokens.push(
        <a key={key} href={m[5]} className="text-brand-forest underline">
          {m[4]}
        </a>,
      );
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
  return tokens;
}

export function Markdown({ source }: { source: string }) {
  const blocks = parse(source);
  return (
    <>
      {blocks.map((b, i) => {
        const key = `b-${i}`;
        switch (b.kind) {
          case "h2":
            return <h2 key={key}>{renderInline(b.text, key)}</h2>;
          case "h3":
            return <h3 key={key}>{renderInline(b.text, key)}</h3>;
          case "p":
            return <p key={key}>{renderInline(b.text, key)}</p>;
          case "ul":
            return (
              <ul key={key}>
                {b.items.map((item, j) => (
                  <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key}>
                {b.items.map((item, j) => (
                  <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </ol>
            );
        }
      })}
    </>
  );
}
