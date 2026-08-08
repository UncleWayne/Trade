import Link from "next/link";
import { getActiveAccount } from "@/lib/actions/active-account";
import { doSignOut } from "@/lib/actions/signout";
import { AccountSwitcher } from "@/components/account-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/trades", label: "Trades" },
  { href: "/dashboard/trades/new", label: "New Trade" },
  { href: "/dashboard/import", label: "Import CSV" },
  { href: "/dashboard/tags", label: "Tags" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { account, accounts } = await getActiveAccount();

  return (
    <div className="flex min-h-screen bg-bg text-fg">
      <aside className="flex w-56 flex-shrink-0 flex-col border-r border-hairline p-4">
        <div className="mb-6 font-serif text-lg text-fg">Trading Journal</div>

        <AccountSwitcher accounts={accounts} activeId={account.id} />

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-fg-muted hover:bg-surface-raised hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          action={async () => {
            "use server";
            await doSignOut();
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm text-fg-muted hover:bg-surface-raised hover:text-fg"
          >
            Sign out
          </button>
        </form>
      </aside>

      <main className="flex-1 p-8">{children}</main>
      <ThemeToggle />
    </div>
  );
}
