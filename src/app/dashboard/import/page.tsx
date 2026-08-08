import { getActiveAccount } from "@/lib/actions/active-account";
import { CsvImportForm } from "@/components/csv-import-form";

export default async function ImportPage() {
  const { account } = await getActiveAccount();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-100">Import CSV</h1>
      <CsvImportForm accountId={account.id} />
    </div>
  );
}
