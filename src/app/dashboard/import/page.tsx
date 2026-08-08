import { getActiveAccount } from "@/lib/actions/active-account";
import { ImportTabs } from "@/components/import-tabs";

export default async function ImportPage() {
  const { account } = await getActiveAccount();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-fg">Import Trades</h1>
      <ImportTabs accountId={account.id} />
    </div>
  );
}
