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
      <label className="mb-1 block text-xs text-neutral-500">Account</label>
      <select
        defaultValue={activeId}
        onChange={(e) => setActiveAccount(e.target.value)}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100"
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
