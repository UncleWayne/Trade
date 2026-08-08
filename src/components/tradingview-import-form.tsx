"use client";

import { useState } from "react";
import { importTradesFromCsvRows } from "@/lib/actions/trades";
import { parseTradingViewExport, type TradingViewParseResult } from "@/lib/tradingview-import";

export function TradingViewImportForm({ accountId }: { accountId: string }) {
  const [balanceText, setBalanceText] = useState<string | null>(null);
  const [orderText, setOrderText] = useState<string | null>(null);
  const [parsed, setParsed] = useState<TradingViewParseResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  function parseIfReady(balance: string | null, order: string | null) {
    if (!balance) {
      setParsed(null);
      return;
    }
    setParsed(parseTradingViewExport(balance, order));
    setDone(null);
  }

  async function handleImport() {
    if (!parsed || parsed.rows.length === 0) return;
    setImporting(true);
    try {
      await importTradesFromCsvRows(accountId, parsed.rows);
      setDone(parsed.rows.length);
      setParsed(null);
      setBalanceText(null);
      setOrderText(null);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-md border border-hairline bg-surface p-4">
        <p className="text-sm text-fg-muted">
          Works with any broker connected through TradingView (Pepperstone included) —
          open the <span className="text-fg">Order history</span> panel at the bottom of
          your chart, click the download icon (⬇) in the top-right, and it saves several
          CSV files at once. You need:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
          <li>
            <span className="text-fg">balance-history</span> — required. Has the realized
            P&amp;L for each closed trade.
          </li>
          <li>
            <span className="text-fg">order-history-all</span> — optional, but recommended.
            Used to find the exact entry time (balance-history only records the close).
          </li>
        </ul>
      </div>

      <div className="rounded-md border border-hairline bg-surface p-4">
        <label className="mb-2 block text-[10px] tracking-wide text-fg-muted uppercase">
          balance-history CSV (required)
        </label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            const text = file ? await file.text() : null;
            setBalanceText(text);
            parseIfReady(text, orderText);
          }}
          className="text-sm text-fg-muted"
        />
      </div>

      <div className="rounded-md border border-hairline bg-surface p-4">
        <label className="mb-2 block text-[10px] tracking-wide text-fg-muted uppercase">
          order-history-all CSV (optional)
        </label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            const text = file ? await file.text() : null;
            setOrderText(text);
            parseIfReady(balanceText, text);
          }}
          className="text-sm text-fg-muted"
        />
      </div>

      {parsed && (
        <div className="rounded-md border border-hairline bg-surface p-4">
          <p className="mb-2 text-sm text-fg">
            Parsed {parsed.rows.length} closed trade(s)
            {parsed.warnings.length > 0 && `, ${parsed.warnings.length} warning(s)`}.
          </p>
          {parsed.warnings.length > 0 && (
            <ul className="mb-3 max-h-40 list-disc space-y-1 overflow-y-auto pl-5 text-xs text-garnet">
              {parsed.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
          <button
            onClick={handleImport}
            disabled={parsed.rows.length === 0 || importing}
            className="rounded-md bg-gradient-to-br from-silver-hi to-silver-lo px-4 py-2 text-sm font-semibold text-on-silver hover:brightness-105 disabled:opacity-50"
          >
            {importing ? "Importing..." : `Import ${parsed.rows.length} trade(s)`}
          </button>
        </div>
      )}

      {done != null && (
        <p className="text-sm text-jade">Imported {done} trade(s) successfully.</p>
      )}
    </div>
  );
}
