import { notFound } from "next/navigation";
import { getTrade, updateTradeNotesAndTags, deleteTradeAndRedirect } from "@/lib/actions/trades";
import { listTags } from "@/lib/actions/tags";

function formatMoney(n: number | null) {
  if (n == null) return "—";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default async function TradeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [trade, allTags] = await Promise.all([getTrade(id), listTags()]);

  if (!trade) notFound();

  const activeTagIds = new Set(trade.tags.map((t) => t.tagId));

  const fields: [string, string][] = [
    ["Symbol", trade.symbol],
    ["Instrument", trade.instrumentType],
    ["Side", trade.side],
    ["Status", trade.status],
    ["Quantity", String(trade.quantity)],
    ["Entry Price", String(trade.entryPrice)],
    ["Exit Price", trade.exitPrice != null ? String(trade.exitPrice) : "—"],
    ["Entry Date", new Date(trade.entryDate).toLocaleString()],
    ["Exit Date", trade.exitDate ? new Date(trade.exitDate).toLocaleString() : "—"],
    ["Fees", formatMoney(trade.fees)],
    ["PnL", formatMoney(trade.pnl)],
  ];

  if (trade.instrumentType === "OPTION") {
    fields.push(
      ["Strike", trade.strike != null ? String(trade.strike) : "—"],
      ["Expiry", trade.expiry ? new Date(trade.expiry).toLocaleDateString() : "—"],
      ["Option Type", trade.optionType ?? "—"]
    );
  }
  if (trade.instrumentType === "FUTURE") {
    fields.push(["Contract Multiplier", trade.contractMultiplier != null ? String(trade.contractMultiplier) : "—"]);
  }
  if (trade.instrumentType === "FOREX") {
    fields.push(["Lot Size", trade.lotSize != null ? String(trade.lotSize) : "—"]);
  }

  const updateAction = updateTradeNotesAndTags.bind(null, trade.id);
  const deleteAction = deleteTradeAndRedirect.bind(null, trade.id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-100">{trade.symbol}</h1>
        <form action={deleteAction}>
          <button
            type="submit"
            className="rounded-md border border-red-900 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950"
          >
            Delete Trade
          </button>
        </form>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm">
        {fields.map(([label, value]) => (
          <div key={label}>
            <div className="text-xs text-neutral-500">{label}</div>
            <div className="text-neutral-200">{value}</div>
          </div>
        ))}
      </div>

      <form action={updateAction} className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <div>
          <div className="mb-1 text-xs text-neutral-500">Tags</div>
          <div className="flex flex-wrap gap-3">
            {allTags.length === 0 && (
              <p className="text-sm text-neutral-500">
                No tags yet — create some on the Tags page.
              </p>
            )}
            {allTags.map((tag) => (
              <label
                key={tag.id}
                className="flex items-center gap-1.5 rounded-md border border-neutral-800 px-2 py-1 text-sm text-neutral-300"
              >
                <input
                  type="checkbox"
                  name="tagIds"
                  value={tag.id}
                  defaultChecked={activeTagIds.has(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-neutral-500">Notes</div>
          <textarea
            name="notes"
            rows={6}
            defaultValue={trade.notes ?? ""}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Save
        </button>
      </form>
    </div>
  );
}
