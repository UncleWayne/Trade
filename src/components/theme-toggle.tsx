"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="fixed bottom-4 left-4 z-50 h-9 w-9 rounded-full border border-hairline bg-surface" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to Pearl Ledger (light)" : "Switch to Obsidian Vault (dark)"}
      title={isDark ? "Pearl Ledger" : "Obsidian Vault"}
      className="fixed bottom-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface text-silver-hi shadow-sm transition-colors hover:border-silver-lo focus-visible:outline focus-visible:outline-2 focus-visible:outline-silver-lo"
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M21 12.4A9 9 0 1 1 11.6 3a7 7 0 0 0 9.4 9.4Z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
        </svg>
      )}
    </button>
  );
}
