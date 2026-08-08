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
        <h1 className="font-serif text-2xl text-fg">{trade.symbol}</h1>
        <form action={deleteAction}>
          <button
            type="submit"
            className="rounded-md border border-garnet/40 px-3 py-1.5 text-sm text-garnet hover:bg-garnet/10"
          >
            Delete Trade
          </button>
        </form>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-3 rounded-md border border-hairline bg-surface p-4 text-sm">
        {fields.map(([label, value]) => (
          <div key={label}>
            <div className="text-[10px] tracking-wide text-fg-muted uppercase">{label}</div>
            <div className="font-mono text-fg tabular-nums">{value}</div>
          </div>
        ))}
      </div>

      <form action={updateAction} className="space-y-4 rounded-md border border-hairline bg-surface p-4">
        <div>
          <div className="mb-1 text-[10px] tracking-wide text-fg-muted uppercase">Tags</div>
          <div className="flex flex-wrap gap-3">
            {allTags.length === 0 && (
              <p className="text-sm text-fg-muted">
                No tags yet — create some on the Tags page.
              </p>
            )}
            {allTags.map((tag) => (
              <label
                key={tag.id}
                className="flex items-center gap-1.5 rounded-md border border-hairline px-2 py-1 text-sm text-fg-muted"
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
          <div className="mb-1 text-[10px] tracking-wide text-fg-muted uppercase">Notes</div>
          <textarea
            name="notes"
            rows={6}
            defaultValue={trade.notes ?? ""}
            className="w-full rounded-md border border-hairline bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-silver-lo"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-gradient-to-br from-silver-hi to-silver-lo px-4 py-2 text-sm font-semibold text-on-silver hover:brightness-105"
        >
          Save
        </button>
      </form>
    </div>
  );
}
