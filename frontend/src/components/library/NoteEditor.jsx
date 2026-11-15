import { BookOpen, Save } from "lucide-react";

const field = "mt-1 block w-full rounded-lg border border-[#cbd9d1] bg-white px-3 py-2.5 focus:border-[#346557] focus:outline-none focus:ring-1 focus:ring-[#346557] disabled:opacity-60";

export default function NoteEditor({ draft, setDraft, busy, onSave, onCancel }) {
    return (
        <section className="mx-auto max-w-4xl">
            <form onSubmit={onSave} className="overflow-hidden rounded-2xl border border-[#dce7e1] bg-white">
                <header className="flex items-center gap-3 border-b border-[#dce7e1] bg-[#e7f0ec] px-4 py-4 sm:px-6">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#346557]"><BookOpen size={20} aria-hidden="true" /></span>
                    <div>
                        <p className="text-xs font-medium text-[#526c62]">Study Library</p>
                        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{draft.id ? "Edit Note" : "Create Note"}</h1>
                    </div>
                </header>
                <div className="space-y-5 p-4 sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                        <label className="block text-sm font-medium">Note title
                            <input autoFocus required disabled={busy} className={field} value={draft.title} placeholder="e.g. Cell Structure"
                                onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
                        </label>
                        <label className="block text-sm font-medium">Subject <span className="text-xs font-normal text-[#526c62]">Optional</span>
                            <input disabled={busy} maxLength={60} className={field} value={draft.subject}
                                onChange={(event) => setDraft({ ...draft, subject: event.target.value })} />
                        </label>
                    </div>
                    <div>
                        <label htmlFor="note-content" className="block text-sm font-medium">Note content</label>
                        <textarea id="note-content" required rows={10} disabled={busy} aria-describedby="note-format-hint"
                            className={field + " resize-y leading-relaxed"} value={draft.description} placeholder="Write your notes here…"
                            onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
                        <p id="note-format-hint" className="mt-2 text-xs text-[#526c62]">Use <code>**key term**</code> to make text bold.</p>
                    </div>
                </div>
                <footer className="flex flex-wrap justify-end gap-2 border-t border-[#dce7e1] bg-[#f8faf9] px-4 py-3 sm:px-6">
                    <button type="button" disabled={busy} onClick={onCancel} className="rounded-lg border border-[#cbd9d1] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#e7f0ec] disabled:opacity-50">Cancel</button>
                    <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-[#346557] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294f43] disabled:opacity-50">
                        <Save size={16} aria-hidden="true" /> {busy ? "Saving…" : "Save Note"}
                    </button>
                </footer>
            </form>
        </section>
    );
}
