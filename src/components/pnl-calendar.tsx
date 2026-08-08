"use client";

import { useState } from "react";

function formatMoney(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

export function PnlCalendar({ dailyPnl }: { dailyPnl: Record<string, number> }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay();

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="rounded-md px-2 py-1 text-sm text-fg-muted hover:bg-surface-raised"
        >
          ← Prev
        </button>
        <div className="font-serif text-sm text-fg">{monthLabel}</div>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="rounded-md px-2 py-1 text-sm text-fg-muted hover:bg-surface-raised"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] tracking-wide text-fg-muted uppercase">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="pb-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day == null) return <div key={`empty-${idx}`} className="h-16" />;
          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
          const pnl = dailyPnl[dateKey];
          const hasPnl = pnl !== undefined;
          const positive = hasPnl && pnl > 0;
          const negative = hasPnl && pnl < 0;

          return (
            <div
              key={dateKey}
              className={`flex h-16 flex-col justify-between rounded-md border p-1.5 text-xs ${
                positive
                  ? "border-jade/30 bg-jade/10 text-jade"
                  : negative
                  ? "border-garnet/30 bg-garnet/10 text-garnet"
                  : "border-hairline bg-surface text-fg-muted"
              }`}
            >
              <span>{day}</span>
              {hasPnl && (
                <span className="font-mono tabular-nums">{formatMoney(pnl)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
