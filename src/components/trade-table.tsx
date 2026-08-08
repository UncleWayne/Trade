"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface TradeRow {
  id: string;
  symbol: string;
  instrumentType: string;
  side: string;
  quantity: number;
  entryPrice: number;
  exitPrice: number | null;
  entryDate: Date;
  status: string;
  pnl: number | null;
}

type SortKey = "symbol" | "entryDate" | "pnl";

function formatMoney(n: number | null) {
  if (n == null) return "—";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function TradeTable({ trades }: { trades: TradeRow[] }) {
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("entryDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const instrumentTypes = useMemo(
    () => Array.from(new Set(trades.map((t) => t.instrumentType))),
    [trades]
  );

  const filtered = useMemo(() => {
    let rows = trades;
    if (filter.trim()) {
      const q = filter.trim().toUpperCase();
      rows = rows.filter((t) => t.symbol.toUpperCase().includes(q));
    }
    if (typeFilter !== "ALL") {
      rows = rows.filter((t) => t.instrumentType === typeFilter);
    }
    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "symbol") cmp = a.symbol.localeCompare(b.symbol);
      else if (sortKey === "entryDate")
        cmp = new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime();
      else if (sortKey === "pnl") cmp = (a.pnl ?? 0) - (b.pnl ?? 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [trades, filter, typeFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const headerClass = (key: SortKey) =>
    `cursor-pointer select-none px-4 py-2 font-medium ${
      sortKey === key ? "text-fg" : ""
    }`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by symbol..."
          className="rounded-md border border-hairline bg-surface px-3 py-1.5 text-sm text-fg outline-none focus:border-silver-lo"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-hairline bg-surface px-3 py-1.5 text-sm text-fg"
        >
          <option value="ALL">All types</option>
          {instrumentTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-md border border-hairline">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline bg-surface-raised text-left text-[10px] tracking-wide text-fg-muted uppercase">
              <th className={headerClass("symbol")} onClick={() => toggleSort("symbol")}>
                Symbol {sortKey === "symbol" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Side</th>
              <th className="px-4 py-2 font-medium">Qty</th>
              <th className="px-4 py-2 font-medium">Entry</th>
              <th className="px-4 py-2 font-medium">Exit</th>
              <th
                className={headerClass("entryDate")}
                onClick={() => toggleSort("entryDate")}
              >
                Entry Date {sortKey === "entryDate" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className={headerClass("pnl")} onClick={() => toggleSort("pnl")}>
                PnL {sortKey === "pnl" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-fg-muted">
                  No trades match.
                </td>
              </tr>
            )}
            {filtered.map((t) => (
              <tr
                key={t.id}
                className="border-b border-hairline last:border-b-0 hover:bg-surface-raised"
              >
                <td className="px-4 py-2">
                  <Link
                    href={`/dashboard/trades/${t.id}`}
                    className="text-fg underline decoration-hairline decoration-1 underline-offset-2 hover:decoration-silver-lo"
                  >
                    {t.symbol}
                  </Link>
                </td>
                <td className="px-4 py-2 text-fg-muted">{t.instrumentType}</td>
                <td className="px-4 py-2 font-mono text-xs text-fg-muted">{t.side}</td>
                <td className="px-4 py-2 font-mono text-fg-muted tabular-nums">{t.quantity}</td>
                <td className="px-4 py-2 font-mono text-fg-muted tabular-nums">{t.entryPrice}</td>
                <td className="px-4 py-2 font-mono text-fg-muted tabular-nums">{t.exitPrice ?? "—"}</td>
                <td className="px-4 py-2 text-fg-muted">
                  {new Date(t.entryDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-fg-muted">{t.status}</td>
                <td
                  className={`px-4 py-2 font-mono tabular-nums ${
                    t.pnl == null
                      ? "text-fg-muted"
                      : t.pnl >= 0
                      ? "text-jade"
                      : "text-garnet"
                  }`}
                >
                  {formatMoney(t.pnl)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
