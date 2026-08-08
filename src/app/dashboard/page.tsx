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
        <h1 className="text-2xl font-semibold text-neutral-100">{account.name}</h1>
        <p className="text-sm text-neutral-500">Overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
          >
            <div className="text-xs text-neutral-500">{c.label}</div>
            <div
              className={`mt-1 text-lg font-semibold ${
                "positive" in c
                  ? c.positive
                    ? "text-emerald-400"
                    : "text-red-400"
                  : "text-neutral-100"
              }`}
            >
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <h2 className="mb-2 text-sm font-medium text-neutral-300">Equity Curve</h2>
        <EquityChart data={equity} />
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <h2 className="mb-2 text-sm font-medium text-neutral-300">PnL Calendar</h2>
        <PnlCalendar dailyPnl={dailyPnl} />
      </div>
    </div>
  );
}
