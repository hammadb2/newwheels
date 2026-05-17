// PDF export for reports and acquisition data room.
//
// Uses jsPDF for generation — no external dependencies beyond what's in the project.
// Each report gets a branded PDF with NewWheels logo, colors, and report date.

// We use a simple HTML-to-PDF approach via the built-in rendering pipeline.
// The actual PDF generation happens on the server via a simple table-based layout.

export type PdfSection = {
  title: string;
  rows: { label: string; value: string }[];
};

export type PdfTableSection = {
  title: string;
  headers: string[];
  rows: string[][];
};

const BRAND = {
  deep: "#0A2818",
  forest: "#155235",
  accent: "#D9FF4E",
  cream: "#F5F1E8",
  ink: "#0A2818",
  muted: "#6B7280",
  white: "#FFFFFF",
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildPdfHtml(opts: {
  title: string;
  subtitle?: string;
  date: string;
  sections?: PdfSection[];
  tables?: PdfTableSection[];
  footer?: string;
}): string {
  const sectionHtml = (opts.sections ?? [])
    .map(
      (s) => `
      <div style="margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:700;color:${BRAND.deep};margin:0 0 8px;border-bottom:2px solid ${BRAND.accent};padding-bottom:4px;">${escapeHtml(s.title)}</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${s.rows
            .map(
              (r) => `<tr>
              <td style="padding:6px 8px;font-size:12px;color:${BRAND.muted};width:40%;border-bottom:1px solid #eee;">${escapeHtml(r.label)}</td>
              <td style="padding:6px 8px;font-size:12px;color:${BRAND.ink};font-weight:600;border-bottom:1px solid #eee;">${escapeHtml(r.value)}</td>
            </tr>`,
            )
            .join("")}
        </table>
      </div>`,
    )
    .join("");

  const tableHtml = (opts.tables ?? [])
    .map(
      (t) => `
      <div style="margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:700;color:${BRAND.deep};margin:0 0 8px;border-bottom:2px solid ${BRAND.accent};padding-bottom:4px;">${escapeHtml(t.title)}</h2>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              ${t.headers.map((h) => `<th style="padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:${BRAND.muted};text-align:left;border-bottom:2px solid ${BRAND.cream};background:${BRAND.cream};">${escapeHtml(h)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${t.rows
              .map(
                (r) => `<tr>
                ${r.map((c) => `<td style="padding:6px 8px;font-size:12px;color:${BRAND.ink};border-bottom:1px solid #eee;">${escapeHtml(c)}</td>`).join("")}
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  @page { size: letter; margin: 1in; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: ${BRAND.ink}; margin: 0; padding: 0; }
</style></head>
<body>
  <div style="padding:24px 0;border-bottom:3px solid ${BRAND.deep};margin-bottom:24px;">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <h1 style="font-size:24px;font-weight:800;color:${BRAND.deep};margin:0;">${escapeHtml(opts.title)}</h1>
        ${opts.subtitle ? `<p style="font-size:14px;color:${BRAND.muted};margin:4px 0 0;">${escapeHtml(opts.subtitle)}</p>` : ""}
      </div>
      <div style="text-align:right;">
        <p style="font-size:20px;font-weight:800;color:${BRAND.deep};margin:0;">NewWheels</p>
        <p style="font-size:11px;color:${BRAND.muted};margin:2px 0 0;">${escapeHtml(opts.date)}</p>
      </div>
    </div>
  </div>
  ${sectionHtml}
  ${tableHtml}
  ${opts.footer ? `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:10px;color:${BRAND.muted};">${escapeHtml(opts.footer)}</div>` : ""}
  <div style="margin-top:40px;padding-top:12px;border-top:2px solid ${BRAND.deep};font-size:9px;color:${BRAND.muted};text-align:center;">
    NewWheels Calgary &middot; Confidential &middot; Generated ${escapeHtml(opts.date)}
  </div>
</body>
</html>`;
}

export function pdfResponse(html: string, filename: string): Response {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
