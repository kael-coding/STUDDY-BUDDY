import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useNoteStore } from "@/store/noteStore.js";
import { useAuthStore } from "@/store/authStore.js";
import LibraryNotes from "@/components/library/LibraryNotes.jsx";
import NoteEditor from "@/components/library/NoteEditor.jsx";
import NoteReader from "@/components/library/NoteReader.jsx";

const subjectKey = (subject) => subject?.trim().toLowerCase() || "";
const emptyNote = { title: "", description: "", subject: "" };
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

    const allNotes = notes.filter((note) => !note.isArchived && !note.deletedAt);
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
    const togglePin = (note) => runAction(() => note.isPinned ? unpinNote(note._id) : pinNote(note._id), () => {}, "Could not update the pin.");

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

    const removeNote = (note, toTrash) => {
        if (!window.confirm(toTrash ? "Move this note to Trash? You can restore it later." : "Archive this note? You can restore it from Archive.")) return;
        runAction(() => toTrash ? deleteNote(note._id) : archiveNote(note._id), () => {
            showList();
            toast.success(toTrash ? "Note moved to Trash." : "Note archived.");
        }, toTrash ? "Could not move the note to Trash." : "Could not archive the note.");
    };

    return (
        <div className="mx-auto max-w-7xl py-4">
            {actionError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{actionError}</p>}
            {draft ? (
                <NoteEditor draft={draft} setDraft={setDraft} busy={busy} onSave={saveNote} onCancel={() => {
                    setDraft(null);
                    setActionError("");
                }} />
            ) : selected ? (
                <NoteReader key={selected._id} note={selected} reviewAgain={reviewAgain} busy={busy}
                    onBack={showList} onEdit={() => editNote(selected)} onPin={() => togglePin(selected)}
                    onArchive={() => removeNote(selected, false)} onTrash={() => removeNote(selected, true)} />
            ) : (
                <>
                    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Study Library</h1>
                            <p className="mt-1 text-sm text-[#526c62]">Browse your notes and reviewers.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/archive" className="text-sm font-semibold text-[#346557] hover:underline">Archive</Link>
                            <button type="button" onClick={() => editNote()} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-[#346557] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#284f44] disabled:opacity-50">
                                <Plus size={17} aria-hidden="true" /> New Note
                            </button>
                        </div>
                    </header>
                    {error && !busy && <p role="alert" className="mb-4 text-sm text-red-800">{error} <button type="button" onClick={getNotes} className="underline">Retry</button></p>}
                    {selectedId && !isLoading && !error && <p role="status" className="mb-4 text-sm text-[#526c62]">This note is unavailable in Study Library.</p>}
                    <LibraryNotes notes={visible} collections={collections} activeCollection={activeCollection[0]} onCollection={setCollection}
                        query={query} onSearch={setQuery} loading={isLoading && !allNotes.length} busy={busy}
                        onOpen={openNote} onPin={togglePin} onArchive={(note) => removeNote(note, false)} onTrash={(note) => removeNote(note, true)} />
                </>
            )}
        </div>
    );
}
export default function DigitalNotebook() {
    const accountId = useAuthStore((state) => state.user?._id);
    return <Library key={accountId} />;
}
