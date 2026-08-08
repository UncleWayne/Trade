interface TradeForStats {
  pnl: number | null;
  exitDate: Date | null;
  entryDate: Date;
}

export interface TradeStats {
  totalPnl: number;
  winRate: number; // 0-100
  avgWin: number;
  avgLoss: number;
  profitFactor: number | null;
  totalTrades: number;
  wins: number;
  losses: number;
}

export function computeStats(trades: TradeForStats[]): TradeStats {
  const closed = trades.filter((t) => t.pnl != null);
  const wins = closed.filter((t) => (t.pnl as number) > 0);
  const losses = closed.filter((t) => (t.pnl as number) < 0);

  const totalPnl = closed.reduce((sum, t) => sum + (t.pnl as number), 0);
  const grossWin = wins.reduce((sum, t) => sum + (t.pnl as number), 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl as number), 0));

  return {
    totalPnl,
    winRate: closed.length ? (wins.length / closed.length) * 100 : 0,
    avgWin: wins.length ? grossWin / wins.length : 0,
    avgLoss: losses.length ? grossLoss / losses.length : 0,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : null,
    totalTrades: closed.length,
    wins: wins.length,
    losses: losses.length,
  };
}

export interface EquityPoint {
  date: string; // ISO date (yyyy-mm-dd)
  cumulativePnl: number;
}

/** Cumulative PnL over time, one point per day that had closed trades. */
export function computeEquityCurve(trades: TradeForStats[]): EquityPoint[] {
  const byDay = new Map<string, number>();

  for (const t of trades) {
    if (t.pnl == null) continue;
    const day = (t.exitDate ?? t.entryDate).toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + t.pnl);
  }

  const days = Array.from(byDay.keys()).sort();
  let running = 0;
  return days.map((day) => {
    running += byDay.get(day)!;
    return { date: day, cumulativePnl: running };
  });
}

/** Map of yyyy-mm-dd -> total PnL for that day, for the calendar heatmap. */
export function computeDailyPnl(trades: TradeForStats[]): Map<string, number> {
  const byDay = new Map<string, number>();
  for (const t of trades) {
    if (t.pnl == null) continue;
    const day = (t.exitDate ?? t.entryDate).toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + t.pnl);
  }
  return byDay;
}
