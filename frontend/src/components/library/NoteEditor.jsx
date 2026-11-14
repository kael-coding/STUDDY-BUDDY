const field = "mt-1 w-full rounded-lg border border-[#cbd9d1] bg-white px-3 py-2";

export default function NoteEditor({ draft, setDraft, busy, onSave, onCancel }) {
    return (
        <section className="max-w-3xl">
            <h1 className="mb-5 text-3xl font-bold tracking-tight">{draft.id ? "Edit Note" : "Create Note"}</h1>
            <form onSubmit={onSave} className="space-y-4 rounded-xl border border-[#dbe6e0] bg-white p-5 sm:p-6">
                <label className="block text-sm font-medium">Note title
                    <input autoFocus required disabled={busy} className={field} value={draft.title}
                        onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
                </label>
                <label className="block text-sm font-medium">Subject
                    <input disabled={busy} className={field} value={draft.subject}
                        onChange={(event) => setDraft({ ...draft, subject: event.target.value })} />
                </label>
                <label className="block text-sm font-medium">Note content
                    <textarea required rows={14} disabled={busy} aria-describedby="note-format-hint" className={field + " resize-y leading-relaxed"} value={draft.description}
                        onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
                </label>
                <p id="note-format-hint" className="text-xs text-[#526c62]">Use **double asterisks** to emphasize key terms.</p>
                <div className="flex justify-end gap-2">
                    <button type="button" disabled={busy} onClick={onCancel} className="rounded-lg border border-[#cbd9d1] px-4 py-2 text-sm font-semibold">Cancel</button>
                    <button type="submit" disabled={busy} className="rounded-lg bg-[#346557] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save Note"}</button>
                </div>
            </form>
        </section>
    );
}
