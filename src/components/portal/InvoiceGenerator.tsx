"use client";

import { useState } from "react";

export function InvoiceGenerator() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate || !endDate) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/portal/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });
      const data = await res.json();

      if (!res.ok) {
        const messages: Record<string, string> = {
          no_purchases: "No purchases found in the selected date range.",
          invalid_input: "Please enter valid start and end dates.",
          email_failed: "Invoice generated but the email failed to send. Please try again.",
        };
        setResult({ ok: false, message: messages[data.error] || "Something went wrong. Please try again." });
        return;
      }

      setResult({
        ok: true,
        message: `Invoice emailed — ${data.purchase_count} lead${data.purchase_count === 1 ? "" : "s"}, ${data.total} total.`,
      });

      // Open the invoice HTML in a new tab for immediate viewing / printing
      if (data.invoice_html) {
        const blob = new Blob([data.invoice_html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    } catch {
      setResult({ ok: false, message: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
      <h2 className="text-lg font-extrabold text-[#0A2818] mb-1">Generate invoice</h2>
      <p className="text-sm text-[#6B7280] mb-4">
        Select a date range and we&apos;ll email you a PDF invoice with your purchase history.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[140px]">
          <label htmlFor="inv-start" className="block text-xs font-semibold text-[#0A2818] mb-1">
            Start date
          </label>
          <input
            id="inv-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#0A2818] focus:outline-none focus:ring-2 focus:ring-[#0A2818]"
            required
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label htmlFor="inv-end" className="block text-xs font-semibold text-[#0A2818] mb-1">
            End date
          </label>
          <input
            id="inv-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#0A2818] focus:outline-none focus:ring-2 focus:ring-[#0A2818]"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !startDate || !endDate}
          className="rounded-lg bg-[#0A2818] px-5 py-2 text-sm font-bold text-[#D9FF4E] hover:bg-[#155235] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Generating…" : "Email invoice"}
        </button>
      </form>

      {result ? (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            result.ok
              ? "bg-green-50 border border-green-200 text-green-900"
              : "bg-red-50 border border-red-200 text-red-900"
          }`}
        >
          {result.message}
        </div>
      ) : null}
    </div>
  );
}
