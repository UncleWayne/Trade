import { listTags, createTagFromForm, deleteTagFromForm } from "@/lib/actions/tags";

export default async function TagsPage() {
  const tags = await listTags();

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 font-serif text-2xl text-fg">Tags</h1>

      <form action={createTagFromForm} className="mb-6 flex gap-2">
        <input
          name="name"
          required
          placeholder="Tag name (e.g. Breakout, FOMO)"
          className="flex-1 rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-silver-lo"
        />
        <input
          name="color"
          type="color"
          defaultValue="#8A8F9C"
          className="h-[38px] w-12 rounded-md border border-hairline bg-surface"
        />
        <button
          type="submit"
          className="rounded-md bg-gradient-to-br from-silver-hi to-silver-lo px-4 py-2 text-sm font-semibold text-on-silver hover:brightness-105"
        >
          Add
        </button>
      </form>

      <div className="space-y-2">
        {tags.length === 0 && (
          <p className="text-sm text-fg-muted">No tags yet.</p>
        )}
        {tags.map((tag) => {
          const deleteAction = deleteTagFromForm.bind(null, tag.id);
          return (
            <div
              key={tag.id}
              className="flex items-center justify-between rounded-md border border-hairline bg-surface px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm text-fg">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </span>
              <form action={deleteAction}>
                <button
                  type="submit"
                  className="text-xs text-garnet hover:underline"
                >
                  Delete
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
