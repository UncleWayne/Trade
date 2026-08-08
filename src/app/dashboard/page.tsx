import { getActiveAccount } from "@/lib/actions/active-account";
import { listTrades } from "@/lib/actions/trades";
import { computeStats, computeEquityCurve, computeDailyPnl } from "@/lib/stats";
import { EquityChart } from "@/components/equity-chart";
import { PnlCalendar } from "@/components/pnl-calendar";

function formatMoney(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

export default async function DashboardPage() {
  const { account } = await getActiveAccount();
  const trades = await listTrades(account.id);

  const stats = computeStats(trades);
  const equity = computeEquityCurve(trades);
  const dailyPnl = Object.fromEntries(computeDailyPnl(trades));

  const cards = [
    { label: "Total PnL", value: formatMoney(stats.totalPnl), positive: stats.totalPnl >= 0 },
    { label: "Win Rate", value: `${stats.winRate.toFixed(1)}%` },
    { label: "Avg Win", value: formatMoney(stats.avgWin) },
    { label: "Avg Loss", value: formatMoney(-stats.avgLoss) },
    {
      label: "Profit Factor",
      value: stats.profitFactor == null ? "—" : stats.profitFactor.toFixed(2),
    },
    { label: "Closed Trades", value: String(stats.totalTrades) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-fg">{account.name}</h1>
        <p className="text-sm text-fg-muted">Overview</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="relative rounded-md border border-hairline bg-surface p-4 before:absolute before:inset-x-2.5 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-silver-lo before:to-transparent before:opacity-60 before:content-['']"
          >
            <div className="text-[10px] tracking-wide text-fg-muted uppercase">{c.label}</div>
            <div
              className={`mt-1.5 font-mono text-lg tabular-nums ${
                "positive" in c
                  ? c.positive
                    ? "text-jade"
                    : "text-garnet"
                  : "text-fg"
              }`}
            >
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-hairline bg-surface p-4">
        <h2 className="mb-2 text-[10px] tracking-wide text-fg-muted uppercase">Equity Curve</h2>
        <EquityChart data={equity} />
      </div>

      <div className="rounded-md border border-hairline bg-surface p-4">
        <h2 className="mb-2 text-[10px] tracking-wide text-fg-muted uppercase">PnL Calendar</h2>
        <PnlCalendar dailyPnl={dailyPnl} />
      </div>
    </div>
  );
}
