import { ArrowLeft, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import FlashcardReview from "@/components/FlashcardReview.jsx";

const button = "rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#e7f0ec] disabled:opacity-50";

export default function NoteReader({ note, reviewAgain, busy, onBack, onEdit, onPin, onArchive, onTrash }) {
    return (
        <div className="max-w-3xl">
            <button type="button" onClick={onBack} disabled={busy} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#346557] hover:underline">
                <ArrowLeft size={16} aria-hidden="true" /> Study Library
            </button>
            <div className="mb-4 flex flex-wrap gap-2">
                <button type="button" className={button} onClick={onEdit} disabled={busy}>Edit</button>
                {!!note.flashcards?.length && <Link to={`/flashcard-review?${new URLSearchParams({ note: note._id, mode: "practice" })}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#346557] px-3 py-2 text-sm font-semibold text-white">
                    <Layers size={16} aria-hidden="true" /> Review Flashcards
                </Link>}
                <button type="button" className={button} onClick={onPin} disabled={busy}>{note.isPinned ? "Unpin" : "Pin"}</button>
                <button type="button" className={button} onClick={onArchive} disabled={busy}>Archive</button>
                <button type="button" className={button + " text-red-700"} onClick={onTrash} disabled={busy}>Move to Trash</button>
            </div>
            <article className="rounded-xl border border-[#dbe6e0] bg-white p-5 sm:p-9">
                <span className="rounded-md bg-[#e7f0ec] px-2 py-1 text-xs font-semibold text-[#346557]">{note.subject?.trim() || "Unsorted"}</span>
                <h1 className="my-4 border-b border-[#dbe6e0] pb-4 text-3xl font-semibold tracking-tight [overflow-wrap:anywhere]">{note.title}</h1>
                <p className="whitespace-pre-wrap leading-7 [overflow-wrap:anywhere]">
                    {note.description?.split(/\*\*(.+?)\*\*/g).map((part, index) =>
                        index % 2 ? <strong key={index}>{part}</strong> : part)}
                </p>
                <FlashcardReview key={String(reviewAgain)} note={note} startFlagged={reviewAgain} />
            </article>
        </div>
    );
}
