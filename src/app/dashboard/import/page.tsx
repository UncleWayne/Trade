import { getActiveAccount } from "@/lib/actions/active-account";
import { CsvImportForm } from "@/components/csv-import-form";

export default async function ImportPage() {
  const { account } = await getActiveAccount();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-fg">Import CSV</h1>
      <CsvImportForm accountId={account.id} />
    </div>
  );
}
