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
        <h1 className="text-2xl font-semibold text-neutral-100">Trades</h1>
        <Link
          href="/dashboard/trades/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          + New Trade
        </Link>
      </div>

      <TradeTable trades={trades} />
    </div>
  );
}
