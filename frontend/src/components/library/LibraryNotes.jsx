import { Archive, Layers, Pin, Search, Trash2 } from "lucide-react";

const dateFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" });

function NoteCard({ note, busy, onOpen, onPin, onArchive, onTrash }) {
    const updated = Date.parse(note.updatedAt || note.createdAt);
    const cards = note.flashcards?.length || 0;
    return (
        <li className="flex min-w-0 flex-col rounded-xl border border-[#dbe6e0] bg-white p-4">
            <span className="self-start rounded-md bg-[#e7f0ec] px-2 py-1 text-xs font-medium text-[#346557]">{note.subject?.trim() || "Unsorted"}</span>
            <button type="button" onClick={() => onOpen(note)} disabled={busy} className="mt-3 self-start text-left font-semibold hover:underline [overflow-wrap:anywhere]">
                {note.title}
            </button>
            <p className="mt-1 line-clamp-2 text-sm text-[#526c62] [overflow-wrap:anywhere]">{note.description?.replace(/\*\*(.+?)\*\*/g, "$1")}</p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-xs text-[#526c62]">
                {Number.isFinite(updated) && <span>Updated {dateFormat.format(updated)}</span>}
                <span className="inline-flex items-center gap-1"><Layers size={14} aria-hidden="true" /> {cards} {cards === 1 ? "card" : "cards"}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 border-t border-[#edf2ef] pt-3 text-xs font-medium">
                <button type="button" disabled={busy} onClick={() => onPin(note)} className="inline-flex items-center gap-1 hover:underline"><Pin size={14} aria-hidden="true" />{note.isPinned ? "Unpin" : "Pin"}</button>
                <button type="button" disabled={busy} onClick={() => onArchive(note)} className="inline-flex items-center gap-1 hover:underline"><Archive size={14} aria-hidden="true" />Archive</button>
                <button type="button" disabled={busy} onClick={() => onTrash(note)} className="inline-flex items-center gap-1 text-red-700 hover:underline"><Trash2 size={14} aria-hidden="true" />Trash</button>
            </div>
        </li>
    );
}

export default function LibraryNotes({ notes, collections, activeCollection, onCollection, query, onSearch, loading, ...actions }) {
    const groups = [
        { label: "Pinned", notes: notes.filter((note) => note.isPinned) },
        { label: "Recent notes", notes: notes.filter((note) => !note.isPinned) },
    ];
    return (
        <>
            <div className="mb-6 flex flex-wrap gap-3">
                <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#dbe6e0] bg-white px-3 py-2 sm:max-w-sm">
                    <Search size={17} aria-hidden="true" />
                    <input type="search" aria-label="Search notes" placeholder="Search title or content" value={query} onChange={(event) => onSearch(event.target.value)} className="min-w-0 flex-1 text-sm" />
                </label>
                <select aria-label="Filter notes by collection" value={activeCollection} onChange={(event) => onCollection(event.target.value)}
                    className="max-w-full rounded-lg border border-[#dbe6e0] bg-white px-3 py-2 text-sm">
                    {collections.map(([key, label, count]) => <option key={key} value={key}>{label} ({count})</option>)}
                </select>
            </div>
            {loading && <p role="status" className="text-sm">Loading notes…</p>}
            {!loading && !notes.length && <p className="rounded-xl border border-[#dbe6e0] bg-white p-6 text-sm text-[#526c62]">No notes in this view.</p>}
            {groups.filter((group) => group.notes.length).map((group) => (
                <section key={group.label} className="mb-6">
                    <h2 className="mb-3 font-semibold">{group.label}</h2>
                    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {group.notes.map((note) => <NoteCard key={note._id} note={note} {...actions} />)}
                    </ul>
                </section>
            ))}
        </>
    );
}
