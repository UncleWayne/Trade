"use client";

import { useState } from "react";
import { CsvImportForm } from "@/components/csv-import-form";
import { TradingViewImportForm } from "@/components/tradingview-import-form";

const TABS = [
  { key: "template", label: "App Template" },
  { key: "tradingview", label: "TradingView / Pepperstone" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ImportTabs({ accountId }: { accountId: string }) {
  const [tab, setTab] = useState<TabKey>("template");

  return (
    <div>
      <div className="mb-6 flex gap-1 border-b border-hairline">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-3 py-2 text-sm ${
              tab === t.key
                ? "border-silver-lo text-fg"
                : "border-transparent text-fg-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "template" ? (
        <CsvImportForm accountId={accountId} />
      ) : (
        <TradingViewImportForm accountId={accountId} />
      )}
    </div>
  );
}
