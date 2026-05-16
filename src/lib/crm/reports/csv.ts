// Minimal RFC4180 CSV builder.

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map((row) => row.map(toCsvCell).join(","))
    .join("\r\n");
}

function toCsvCell(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "number" ? v.toString() : v;
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename.replace(/[^a-z0-9_\-\.]/gi, "_")}"`,
      "Cache-Control": "no-store",
    },
  });
}
