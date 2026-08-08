"use client";

import { useState } from "react";
import Papa from "papaparse";
import { importTradesFromCsvRows, type CsvTradeRow } from "@/lib/actions/trades";

const TEMPLATE = `symbol,instrumentType,side,quantity,entryPrice,exitPrice,entryDate,exitDate,fees,contractMultiplier,lotSize,strike,expiry,optionType,notes
AAPL,STOCK,LONG,100,150.25,155.50,2026-01-05T09:30,2026-01-05T15:45,1.00,,,,,,"Breakout entry"
ES,FUTURE,SHORT,2,4500,4480,2026-01-06T09:31,2026-01-06T10:15,4.20,50,,,,,"Faded the open"
EURUSD,FOREX,LONG,1,1.0850,1.0900,2026-01-07T03:00,2026-01-07T08:00,0,,100000,,,,
`;

const REQUIRED_COLUMNS = ["symbol", "instrumentType", "side", "quantity", "entryPrice", "entryDate"];

interface ParsedResult {
  rows: CsvTradeRow[];
  errors: string[];
}

function parseCsv(text: string): ParsedResult {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = result.errors.map(
    (e) => `Row ${e.row ?? "?"}: ${e.message}`
  );
  const rows: CsvTradeRow[] = [];

  result.data.forEach((raw, idx) => {
    const missing = REQUIRED_COLUMNS.filter((c) => !raw[c]);
    if (missing.length > 0) {
      errors.push(`Row ${idx + 2}: missing ${missing.join(", ")}`);
      return;
    }

    const num = (v: string | undefined) =>
      v && v.trim() !== "" ? Number(v) : undefined;

    rows.push({
      symbol: raw.symbol.trim(),
      instrumentType: raw.instrumentType.trim().toUpperCase() as CsvTradeRow["instrumentType"],
      side: raw.side.trim().toUpperCase() as CsvTradeRow["side"],
      quantity: Number(raw.quantity),
      entryPrice: Number(raw.entryPrice),
      exitPrice: num(raw.exitPrice) ?? null,
      entryDate: raw.entryDate.trim(),
      exitDate: raw.exitDate?.trim() || null,
      fees: num(raw.fees) ?? 0,
      contractMultiplier: num(raw.contractMultiplier) ?? null,
      lotSize: num(raw.lotSize) ?? null,
      strike: num(raw.strike) ?? null,
      expiry: raw.expiry?.trim() || null,
      optionType: (raw.optionType?.trim().toUpperCase() || null) as CsvTradeRow["optionType"],
      notes: raw.notes?.trim() || null,
    });
  });

  return { rows, errors };
}

function downloadTemplate() {
  const blob = new Blob([TEMPLATE], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "trade-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function CsvImportForm({ accountId }: { accountId: string }) {
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  async function handleFile(file: File) {
    const text = await file.text();
    setParsed(parseCsv(text));
    setDone(null);
  }

  async function handleImport() {
    if (!parsed || parsed.rows.length === 0) return;
    setImporting(true);
    try {
      await importTradesFromCsvRows(accountId, parsed.rows);
      setDone(parsed.rows.length);
      setParsed(null);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-md border border-hairline bg-surface p-4">
        <p className="mb-3 text-sm text-fg-muted">
          Import trades from a CSV using our template format. Required columns:{" "}
          {REQUIRED_COLUMNS.join(", ")}.
        </p>
        <button
          onClick={downloadTemplate}
          className="rounded-md border border-hairline px-3 py-1.5 text-sm text-fg hover:bg-surface-raised"
        >
          Download template CSV
        </button>
      </div>

      <div className="rounded-md border border-hairline bg-surface p-4">
        <label className="mb-2 block text-[10px] tracking-wide text-fg-muted uppercase">CSV file</label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="text-sm text-fg-muted"
        />
      </div>

      {parsed && (
        <div className="rounded-md border border-hairline bg-surface p-4">
          <p className="mb-2 text-sm text-fg">
            Parsed {parsed.rows.length} valid row(s)
            {parsed.errors.length > 0 && `, ${parsed.errors.length} error(s)`}.
          </p>
          {parsed.errors.length > 0 && (
            <ul className="mb-3 max-h-40 list-disc space-y-1 overflow-y-auto pl-5 text-xs text-garnet">
              {parsed.errors.map((e, i) => (
                <li key={i}>{e}</li>
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
        <p className="text-sm text-jade">
          Imported {done} trade(s) successfully.
        </p>
      )}
    </div>
  );
}
