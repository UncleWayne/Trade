import { getActiveAccount } from "@/lib/actions/active-account";
import { listTags } from "@/lib/actions/tags";
import { TradeForm } from "@/components/trade-form";

export default async function NewTradePage() {
  const { account } = await getActiveAccount();
  const tags = await listTags();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-fg">New Trade</h1>
      <TradeForm accountId={account.id} tags={tags} />
    </div>
  );
}
