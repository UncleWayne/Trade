"use client";

import { setActiveAccount } from "@/lib/actions/active-account";

interface Account {
  id: string;
  name: string;
}

export function AccountSwitcher({
  accounts,
  activeId,
}: {
  accounts: Account[];
  activeId: string;
}) {
  return (
    <div className="mb-6">
      <label className="mb-1 block text-[10px] tracking-wide text-fg-muted uppercase">Account</label>
      <select
        defaultValue={activeId}
        onChange={(e) => setActiveAccount(e.target.value)}
        className="w-full rounded-md border border-hairline bg-surface px-2 py-1.5 text-sm text-fg"
      >
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>
  );
}
