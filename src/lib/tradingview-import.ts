import Papa from "papaparse";
import type { CsvTradeRow } from "@/lib/actions/trades";

interface BalanceHistoryRow {
  Time: string;
  Action: string;
}

interface OrderHistoryRow {
  Symbol: string;
  Side: string;
  Status: string;
  "Fill price": string;
  "Closing time": string;
}

// e.g. "Close short position for symbol PEPPERSTONE:XAUUSD at price 4255.26 for 2 units.
//       Position AVG Price was 4253.670000, currency: USD, rate: 1.000000, point value: 1.000000"
const CLOSE_ACTION_RE =
  /Close (long|short) position for symbol [^:]*:(\S+) at price ([\d.]+) for ([\d.]+) units\. Position AVG Price was ([\d.]+).*?point value: ([\d.]+)/i;

function toIsoLocal(tvTimestamp: string): string {
  return tvTimestamp.trim().replace(" ", "T");
}

export interface TradingViewParseResult {
  rows: CsvTradeRow[];
  warnings: string[];
}

/**
 * Parses a TradingView "balance history" export (works for any broker connected
 * through TradingView, not just Pepperstone) into round-trip trade rows.
 *
 * The balance-history Action text already carries entry/exit price, quantity,
 * side, and the instrument's point value, so trades import as instrumentType
 * "FUTURE" with that point value as the contractMultiplier — reusing the
 * existing PnL engine's multiplier math instead of guessing forex lot sizes.
 *
 * order-history is optional: balance-history only records the close time, so
 * order-history (all "Filled" fills) is used to find the matching opening fill
 * for an accurate entry time. Without it, entry time falls back to exit time.
 */
export function parseTradingViewExport(
  balanceHistoryCsv: string,
  orderHistoryCsv: string | null
): TradingViewParseResult {
  const balanceRows = Papa.parse<BalanceHistoryRow>(balanceHistoryCsv, {
    header: true,
    skipEmptyLines: true,
  }).data;

  const filledOrders = orderHistoryCsv
    ? Papa.parse<OrderHistoryRow>(orderHistoryCsv, {
        header: true,
        skipEmptyLines: true,
      }).data.filter((o) => o.Status === "Filled")
    : [];

  const rows: CsvTradeRow[] = [];
  const warnings: string[] = [];

  balanceRows.forEach((row, idx) => {
    const match = row.Action?.match(CLOSE_ACTION_RE);
    if (!match) return; // not a position-close row (deposit, fee, etc.) — skip

    const [, closedSide, symbol, exitPriceStr, qtyStr, avgPriceStr, pointValueStr] = match;
    const side = closedSide.toUpperCase() === "SHORT" ? "SHORT" : "LONG";
    const exitPrice = Number(exitPriceStr);
    const quantity = Number(qtyStr);
    const entryPrice = Number(avgPriceStr);
    const contractMultiplier = Number(pointValueStr);
    const exitDate = row.Time;

    const openSide = side === "SHORT" ? "Sell" : "Buy";
    const candidates = filledOrders
      .filter(
        (o) =>
          o.Side === openSide &&
          o.Symbol.endsWith(symbol) &&
          Math.abs(Number(o["Fill price"]) - entryPrice) < 0.005 &&
          o["Closing time"] <= exitDate
      )
      .sort((a, b) => (a["Closing time"] < b["Closing time"] ? 1 : -1));

    const entryDate = candidates[0]?.["Closing time"] ?? exitDate;
    if (!candidates[0]) {
      warnings.push(
        `Row ${idx + 2} (${symbol}): couldn't find the opening order — used the close time as the entry time too. Edit the entry time after import if you have it.`
      );
    }

    rows.push({
      symbol,
      instrumentType: "FUTURE",
      side,
      quantity,
      entryPrice,
      exitPrice,
      entryDate: toIsoLocal(entryDate),
      exitDate: toIsoLocal(exitDate),
      fees: 0,
      contractMultiplier,
      notes: "Imported from TradingView",
    });
  });

  return { rows, warnings };
}
