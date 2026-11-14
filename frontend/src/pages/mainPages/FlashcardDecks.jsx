import { useEffect } from "react";
import { ArrowLeft, BookOpen, Layers, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import FlashcardReview from "@/components/FlashcardReview.jsx";
import { useNoteStore } from "@/store/noteStore.js";

const primary = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#346557] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#284f44] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346557]";
const secondary = "inline-flex items-center justify-center gap-2 rounded-lg border border-[#cbd9d1] px-4 py-2.5 text-sm font-semibold text-[#233e35] hover:bg-[#eff5f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346557]";

export default function FlashcardDecks() {
    const { notes, getNotes, isLoading, error } = useNoteStore();
    const [params] = useSearchParams();
    const deckId = params.get("note");
    const mode = params.get("mode");
    const decks = notes.filter((note) => !note.isArchived && !note.deletedAt && note.flashcards?.length);
    const selected = decks.find((note) => note._id === deckId);

    useEffect(() => {
        getNotes();
    }, [getNotes]);

    return (
        <div className="mx-auto max-w-6xl px-1 py-4 sm:px-4 sm:py-6">
            {deckId && (
                <Link to="/flashcard-review" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#346557] hover:underline">
                    <ArrowLeft size={16} aria-hidden="true" /> All decks
                </Link>
            )}
            <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-3xl font-bold tracking-tight text-[#233e35] [overflow-wrap:anywhere]">{selected?.title || "Flashcard Review"}</h1>
                    <p className="mt-1 text-sm text-[#4c6459]">{selected ? selected.subject || "Unsorted" : "Practice questions from your study notes."}</p>
                </div>
                <Link to={selected ? `/digital-notebook?${new URLSearchParams({ note: selected._id })}` : "/digital-notebook"} className={secondary}>
                    {selected ? <BookOpen size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                    {selected ? "Open Source Note" : "Add Cards from Study Library"}
                </Link>
            </header>
            {error && (
                <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                    {error} <button type="button" onClick={getNotes} className="underline">Retry</button>
                </p>
            )}
            {isLoading && !notes.length && <p role="status" className="text-sm">Loading flashcards…</p>}
            {selected && (
                <div className="rounded-xl border border-[#dbe6e0] bg-white px-4 pb-5 sm:px-6">
                    <FlashcardReview key={`${selected._id}/${mode}`} note={selected} startAll={mode === "practice"} startFlagged={mode === "again"} />
                </div>
            )}
            {deckId && !selected && !isLoading && !error && <p role="status" className="text-sm">This deck is unavailable. Open Study Library to check the source note.</p>}
            {!deckId && !isLoading && !error && !decks.length && (
                <div className="rounded-xl border border-[#dbe6e0] bg-white p-8 text-center text-[#4c6459]">
                    <Layers size={26} aria-hidden="true" className="mx-auto mb-3" />
                    <h2 className="font-semibold text-[#233e35]">No flashcard decks yet</h2>
                    <p className="mt-2 text-sm">Open a note in Study Library and choose Add Card to create your first deck.</p>
                </div>
            )}
            {!deckId && !!decks.length && (
                <ul className="grid gap-4 md:grid-cols-2">
                    {decks.map((note) => {
                        const total = note.flashcards.length;
                        const flagged = note.flashcards.filter((card) => card.reviewAgain).length;
                        const deckLink = (reviewMode) => `/flashcard-review?${new URLSearchParams({ note: note._id, mode: reviewMode })}`;
                        return (
                            <li key={note._id} className="flex min-w-0 flex-col rounded-xl border border-[#dbe6e0] bg-white p-5 sm:p-6">
                                <p className="mb-3 self-start rounded-md bg-[#e5efea] px-2 py-1 text-xs font-semibold text-[#346557]">{note.subject || "Unsorted"}</p>
                                <h2 className="text-lg font-semibold text-[#233e35] [overflow-wrap:anywhere]">{note.title}</h2>
                                <p className="mb-5 mt-2 flex flex-wrap gap-3 text-sm text-[#4c6459]">
                                    <span>{total} {total === 1 ? "card" : "cards"}</span>
                                    <span className={flagged ? "font-medium text-amber-800" : ""}>{flagged} Review Again</span>
                                </p>
                                <div className="mt-auto flex flex-wrap gap-2">
                                    <Link to={deckLink("practice")} aria-label={`Practice ${note.title}`} className={primary + " flex-1"}>Practice</Link>
                                    {!!flagged && <Link to={deckLink("again")} aria-label={`Review flagged cards in ${note.title}`} className={secondary}>Review Again</Link>}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
