import { listTags, createTagFromForm, deleteTagFromForm } from "@/lib/actions/tags";

export default async function TagsPage() {
  const tags = await listTags();

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-100">Tags</h1>

      <form action={createTagFromForm} className="mb-6 flex gap-2">
        <input
          name="name"
          required
          placeholder="Tag name (e.g. Breakout, FOMO)"
          className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-500"
        />
        <input
          name="color"
          type="color"
          defaultValue="#6366f1"
          className="h-[38px] w-12 rounded-md border border-neutral-700 bg-neutral-950"
        />
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Add
        </button>
      </form>

      <div className="space-y-2">
        {tags.length === 0 && (
          <p className="text-sm text-neutral-500">No tags yet.</p>
        )}
        {tags.map((tag) => {
          const deleteAction = deleteTagFromForm.bind(null, tag.id);
          return (
            <div
              key={tag.id}
              className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm text-neutral-200">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </span>
              <form action={deleteAction}>
                <button
                  type="submit"
                  className="text-xs text-red-400 hover:underline"
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
