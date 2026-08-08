"use client";

import { useActionState, useState } from "react";
import { createTradeFromForm, type CreateTradeFormState } from "@/lib/actions/trades";

const INSTRUMENT_TYPES = ["STOCK", "OPTION", "FUTURE", "FOREX", "CRYPTO"] as const;
type InstrumentType = (typeof INSTRUMENT_TYPES)[number];

interface Tag {
  id: string;
  name: string;
}

const initialState: CreateTradeFormState = {};

const inputClass =
  "w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-500";
const labelClass = "mb-1 block text-xs text-neutral-500";

export function TradeForm({
  accountId,
  tags,
}: {
  accountId: string;
  tags: Tag[];
}) {
  const [state, formAction, pending] = useActionState(createTradeFromForm, initialState);
  const [instrumentType, setInstrumentType] = useState<InstrumentType>("STOCK");

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="accountId" value={accountId} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Instrument Type</label>
          <select
            name="instrumentType"
            value={instrumentType}
            onChange={(e) => setInstrumentType(e.target.value as InstrumentType)}
            className={inputClass}
          >
            {INSTRUMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Symbol</label>
          <input name="symbol" required placeholder="AAPL" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Side</label>
          <select name="side" className={inputClass} defaultValue="LONG">
            <option value="LONG">Long</option>
            <option value="SHORT">Short</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Quantity</label>
          <input
            name="quantity"
            type="number"
            step="any"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Entry Price</label>
          <input
            name="entryPrice"
            type="number"
            step="any"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Exit Price (optional — leave blank for open trades)</label>
          <input name="exitPrice" type="number" step="any" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Entry Date</label>
          <input
            name="entryDate"
            type="datetime-local"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Exit Date</label>
          <input name="exitDate" type="datetime-local" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Fees</label>
        <input
          name="fees"
          type="number"
          step="any"
          defaultValue={0}
          className={`${inputClass} max-w-xs`}
        />
      </div>

      {instrumentType === "OPTION" && (
        <div className="grid grid-cols-3 gap-4 rounded-md border border-neutral-800 p-4">
          <div>
            <label className={labelClass}>Strike</label>
            <input name="strike" type="number" step="any" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Expiry</label>
            <input name="expiry" type="date" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Option Type</label>
            <select name="optionType" className={inputClass} defaultValue="CALL">
              <option value="CALL">Call</option>
              <option value="PUT">Put</option>
            </select>
          </div>
        </div>
      )}

      {instrumentType === "FUTURE" && (
        <div className="rounded-md border border-neutral-800 p-4">
          <label className={labelClass}>Contract Multiplier</label>
          <input
            name="contractMultiplier"
            type="number"
            step="any"
            placeholder="e.g. 50 for ES"
            className={`${inputClass} max-w-xs`}
          />
        </div>
      )}

      {instrumentType === "FOREX" && (
        <div className="rounded-md border border-neutral-800 p-4">
          <label className={labelClass}>Lot Size</label>
          <input
            name="lotSize"
            type="number"
            step="any"
            placeholder="e.g. 100000 for a standard lot"
            className={`${inputClass} max-w-xs`}
          />
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <label className={labelClass}>Tags</label>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className="flex items-center gap-1.5 rounded-md border border-neutral-800 px-2 py-1 text-sm text-neutral-300"
              >
                <input type="checkbox" name="tagIds" value={tag.id} />
                {tag.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>Notes</label>
        <textarea name="notes" rows={4} className={inputClass} />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Trade"}
      </button>
    </form>
  );
}
