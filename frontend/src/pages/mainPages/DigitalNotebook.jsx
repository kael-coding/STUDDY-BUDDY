import { useEffect, useState } from "react";
import { Archive, ArrowLeft, BookOpen, Pin, Plus, Search, Trash2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useNoteStore } from "../../store/noteStore.js";
import { useAuthStore } from "../../store/authStore.js";
import FlashcardReview from "../../components/FlashcardReview.jsx";

const subjectKey = (subject) => subject?.trim().toLowerCase() || "";
const emptyNote = { title: "", description: "", subject: "" };
const fieldClass = "mt-1 w-full rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-gray-900 focus-visible:outline-2 focus-visible:outline-[#346557]";
const secondaryButton = "inline-flex items-center gap-1.5 rounded-lg border border-[#cbd9d1] px-3 py-2 text-sm font-medium hover:bg-[#eff5f1] disabled:opacity-50";
const primaryButton = "inline-flex items-center gap-2 rounded-lg bg-[#346557] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#284f44] disabled:opacity-50";

function Library() {
    const { notes, isLoading, error, getNotes, createNote, updateNote, deleteNote, archiveNote, pinNote, unpinNote } = useNoteStore();
    const [collection, setCollection] = useState("all");
    const [query, setQuery] = useState("");
    const [params, setParams] = useSearchParams();
    const selectedId = params.get("note");
    const reviewAgain = params.get("review") === "again";
    const [draft, setDraft] = useState(null);
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        getNotes();
    }, [getNotes]);

    const allNotes = notes.filter((note) => !note.isArchived);
    const pinnedCount = allNotes.filter((note) => note.isPinned).length;
    const subjects = new Map();
    for (const note of allNotes) {
        const key = subjectKey(note.subject);
        const current = subjects.get(key);
        subjects.set(key, { label: current?.label || note.subject?.trim() || "Unsorted", count: (current?.count || 0) + 1 });
    }
    const collections = [
        ["all", "All notes", allNotes.length],
        ["pinned", "Pinned", pinnedCount],
        ...Array.from(subjects).sort((a, b) => a[1].label.localeCompare(b[1].label))
            .map(([key, { label, count }]) => ["subject:" + key, label, count]),
    ];
    const activeCollection = collections.find(([key]) => key === collection) || collections[0];
    const search = query.trim().toLowerCase();
    const visible = allNotes.filter((note) => {
        if (activeCollection[0] === "pinned" && !note.isPinned) return false;
        if (activeCollection[0].startsWith("subject:") && activeCollection[0] !== "subject:" + subjectKey(note.subject)) return false;
        return !search || [note.title, note.description, note.subject].some((value) => value?.toLowerCase().includes(search));
    }).sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned))
        || (b.updatedAt || "").localeCompare(a.updatedAt || ""));

    const selected = allNotes.find((note) => note._id === selectedId);
    const showingDetail = Boolean(selected || draft);

    const showList = () => {
        setParams({}, { replace: true });
        setDraft(null);
        setActionError("");
    };

    const runAction = async (operation, onSuccess, failureMessage) => {
        setBusy(true);
        setActionError("");
        try {
            const result = await operation();
            if (!result) {
                setActionError(useNoteStore.getState().error || failureMessage);
                return;
            }
            onSuccess(result);
        } catch (requestError) {
            setActionError(requestError.response?.data?.message || failureMessage);
        } finally {
            setBusy(false);
        }
    };

    const openNote = (note) => {
        setParams({ note: note._id }, { replace: true });
        setActionError("");
    };

    const editNote = (note) => {
        setActionError("");
        setDraft(note ? { id: note._id, title: note.title, description: note.description || "", subject: note.subject || "" } : {
            ...emptyNote,
            subject: activeCollection[0].startsWith("subject:") && activeCollection[0] !== "subject:" ? activeCollection[1] : "",
        });
    };

    const saveNote = (event) => {
        event.preventDefault();
        const { id, title, description, subject } = draft;
        if (!title.trim() || !description.trim()) {
            setActionError("Enter a title and some notes before saving.");
            return;
        }
        const data = { title: title.trim(), description: description.trim(), subject: subject.trim() };
        runAction(() => id ? updateNote(id, data) : createNote(data), (note) => {
            setDraft(null);
            setCollection("all");
            setQuery("");
            openNote(note);
            toast.success(id ? "Note updated." : "Note created.");
        }, "Could not save the note.");
    };

    const removeNote = (toTrash) => {
        if (toTrash && !window.confirm("Move this note to Trash? You can restore it later.")) return;
        runAction(() => toTrash ? deleteNote(selectedId) : archiveNote(selectedId), () => {
            showList();
            toast.success(toTrash ? "Note moved to Trash." : "Note archived.");
        }, toTrash ? "Could not move the note to Trash." : "Could not archive the note.");
    };

    return (
        <div className="mx-auto max-w-7xl px-1 py-4 sm:px-4 sm:py-6">
            <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-[#233e35]">Study Library</h1>
                <div className="flex items-center gap-3">
                    <Link to="/archive" className="text-sm font-medium text-[#346557] hover:underline">Archive</Link>
                    <button type="button" onClick={() => editNote()} disabled={busy || !!draft} className={primaryButton}>
                        <Plus size={17} aria-hidden="true" /> New Note
                    </button>
                </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,2fr)]">
                <section aria-label="Browse notes" className={"min-w-0 rounded-xl border border-[#dbe6e0] bg-white " + (showingDetail ? "hidden lg:block" : "")}>
                    <div className="border-b border-[#edf2ef] p-4">
                        <label className="flex items-center gap-2 rounded-lg border border-[#cbd9d1] px-3 py-2 focus-within:ring-2 focus-within:ring-[#346557]">
                            <Search size={17} aria-hidden="true" />
                            <input type="search" aria-label="Search notes" placeholder="Search title or content" value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                className="min-w-0 flex-1 text-sm outline-none" />
                        </label>
                        <label className="mt-3 block text-sm font-medium text-[#233e35]">
                            Collection
                            <select className={fieldClass} value={activeCollection[0]} onChange={(event) => setCollection(event.target.value)}>
                                {collections.map(([key, label, count]) => <option key={key} value={key}>{label} ({count})</option>)}
                            </select>
                        </label>
                    </div>
                    {isLoading && !allNotes.length && <p role="status" className="p-4 text-sm">Loading notes…</p>}
                    {error && !busy && !showingDetail && (
                        <p role="alert" className="p-4 text-sm text-red-800">
                            {error} <button type="button" onClick={getNotes} className="underline">Retry</button>
                        </p>
                    )}
                    {!isLoading && !error && visible.length === 0 && (
                        <p className="p-4 text-sm text-gray-600">
                            {search ? "No notes match your search." : activeCollection[0] === "pinned" ? "No pinned notes yet." : "No notes here yet."}
                        </p>
                    )}
                    {selectedId && !selected && !isLoading && !error && (
                        <p role="status" className="px-4 py-3 text-sm text-gray-600">This note is unavailable in Study Library.</p>
                    )}
                    <ul className="divide-y divide-[#edf2ef]">
                        {visible.map((note) => (
                            <li key={note._id}>
                                <button type="button" disabled={busy || !!draft} onClick={() => openNote(note)}
                                    aria-current={note._id === selectedId ? "true" : undefined}
                                    className={"block w-full px-4 py-3 text-left hover:bg-[#eff5f1] disabled:opacity-60 " + (note._id === selectedId ? "bg-[#e5f1eb]" : "")}>
                                    <span className="flex items-center gap-2 font-semibold text-[#233e35]">
                                        {note.isPinned && <Pin size={15} aria-label="Pinned" />}
                                        <span className="break-words [overflow-wrap:anywhere]">{note.title}</span>
                                    </span>
                                    <span className="mt-1 block text-xs text-[#4c6459]">{note.subject?.trim() || "Unsorted"}</span>
                                    {note.description && <span className="mt-1 block truncate text-sm text-gray-600">{note.description}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>

                <section aria-label={draft ? "Note editor" : "Note reader"} className={"min-w-0 rounded-xl border border-[#dbe6e0] bg-white p-4 sm:p-6 " + (showingDetail ? "" : "hidden lg:block")}>
                    {showingDetail && !draft && <button type="button" disabled={busy} onClick={showList} className={secondaryButton + " mb-4 lg:hidden"}>
                        <ArrowLeft size={16} aria-hidden="true" /> Back to notes
                    </button>}
                    {actionError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{actionError}</p>}
                    {draft ? (
                        <form onSubmit={saveNote} className="space-y-4">
                            <h2 className="text-xl font-semibold text-[#233e35]">{draft.id ? "Edit Note" : "New Note"}</h2>
                            <label className="block text-sm font-medium">Title
                                <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                                    required disabled={busy} className={fieldClass} />
                            </label>
                            <label className="block text-sm font-medium">Subject
                                <input value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
                                    list="library-subjects" maxLength={60} placeholder="Optional" disabled={busy} className={fieldClass} />
                            </label>
                            <datalist id="library-subjects">
                                {Array.from(subjects).filter(([key]) => key).map(([key, subject]) => <option key={key} value={subject.label} />)}
                            </datalist>
                            <label className="block text-sm font-medium">Notes
                                <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                                    rows={12} required disabled={busy} className={fieldClass + " resize-y"} />
                            </label>
                            <div className="flex flex-wrap justify-end gap-2">
                                <button type="button" disabled={busy} className={secondaryButton} onClick={() => {
                                    setDraft(null);
                                    setActionError("");
                                }}>Cancel</button>
                                <button type="submit" disabled={busy} className={primaryButton}>{busy ? "Saving…" : "Save Note"}</button>
                            </div>
                        </form>
                    ) : selected ? (
                        <article>
                            <div className="mb-4 border-b border-[#edf2ef] pb-4">
                                <p className="mb-1 text-sm font-medium text-[#4c6459]">{selected.subject?.trim() || "Unsorted"}</p>
                                <h2 className="text-2xl font-bold text-[#233e35] [overflow-wrap:anywhere]">{selected.title}</h2>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button type="button" className={primaryButton} disabled={busy} onClick={() => editNote(selected)}>Edit</button>
                                    <button type="button" className={secondaryButton} disabled={busy}
                                        onClick={() => runAction(() => selected.isPinned ? unpinNote(selectedId) : pinNote(selectedId), () => {}, "Could not update the pin.")}>
                                        <Pin size={15} aria-hidden="true" /> {selected.isPinned ? "Unpin" : "Pin"}
                                    </button>
                                    <button type="button" className={secondaryButton} disabled={busy} onClick={() => removeNote(false)}>
                                        <Archive size={15} aria-hidden="true" /> Archive
                                    </button>
                                    <button type="button" className={secondaryButton + " text-red-700"} disabled={busy} onClick={() => removeNote(true)}>
                                        <Trash2 size={15} aria-hidden="true" /> Move to Trash
                                    </button>
                                </div>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed text-gray-800 [overflow-wrap:anywhere]">{selected.description}</p>
                            <FlashcardReview key={`${selected._id}/${reviewAgain}`} note={selected} startFlagged={reviewAgain} />
                        </article>
                    ) : (
                        <div className="flex min-h-52 flex-col items-center justify-center gap-2 text-center text-sm text-[#4c6459]">
                            <BookOpen size={24} aria-hidden="true" />
                            <p>Select a note to read it here.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default function DigitalNotebook() {
    const accountId = useAuthStore((state) => state.user?._id);
    return <Library key={accountId} />;
}
