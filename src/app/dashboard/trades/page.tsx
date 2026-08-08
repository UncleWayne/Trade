import Link from "next/link";
import { getActiveAccount } from "@/lib/actions/active-account";
import { listTrades } from "@/lib/actions/trades";
import { TradeTable } from "@/components/trade-table";

export default async function TradesPage() {
  const { account } = await getActiveAccount();
  const trades = await listTrades(account.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-fg">Trades</h1>
        <Link
          href="/dashboard/trades/new"
          className="rounded-md bg-gradient-to-br from-silver-hi to-silver-lo px-4 py-2 text-sm font-semibold text-on-silver hover:brightness-105"
        >
          + New Trade
        </Link>
      </div>

      <TradeTable trades={trades} />
    </div>
  );
}
