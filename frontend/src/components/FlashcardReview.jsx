import { useEffect, useRef, useState } from "react";
import { useNoteStore } from "../store/noteStore.js";

const actionClass = "rounded-lg border border-[#cbd9d1] px-3 py-2 text-sm font-semibold text-[#295547] hover:bg-[#e5f1eb] disabled:opacity-50";

export default function FlashcardReview({ note, startFlagged = false, startAll = false }) {
    const save = useNoteStore((state) => state.saveFlashcard);
    const cards = note.flashcards || [];
    const [draft, setDraft] = useState(null);
    const [queue, setQueue] = useState(() => startAll || startFlagged
        ? cards.filter((card) => startAll || card.reviewAgain).map((card) => card._id)
        : null);
    const [revealed, setRevealed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const section = useRef(null);
    const current = cards.find((card) => card._id === queue?.[0]);
    const flagged = cards.filter((card) => card.reviewAgain);

    useEffect(() => {
        if (startFlagged || startAll) section.current?.focus();
    }, [startFlagged, startAll]);

    const persist = async (change, onSuccess) => {
        setBusy(true);
        setError("");
        try {
            if (await save(note._id, change)) onSuccess();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not save the flashcard change.");
        } finally {
            setBusy(false);
        }
    };

    const start = (items) => {
        setRevealed(false);
        setQueue(items.map((card) => card._id));
    };

    const grade = (reviewAgain) => persist({ action: "patch", cardId: current._id, reviewAgain }, () => {
        setQueue((remaining) => remaining.slice(1));
        setRevealed(false);
    });

    return (
        <section ref={section} tabIndex={-1} className="mt-6 border-t border-[#dbe6e0] pt-5" aria-label="Flashcards">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-[#233e35]">Flashcards <span className="text-sm font-normal">({cards.length})</span></h3>
                {queue === null && !draft && (
                    <button type="button" disabled={busy || cards.length >= 100} onClick={() => setDraft({ question: "", answer: "" })} className={actionClass}>Add Card</button>
                )}
            </div>
            {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
            {draft && (
                <form className="mt-3 space-y-3" onSubmit={(event) => {
                    event.preventDefault();
                    persist({ action: "post", ...draft }, () => setDraft(null));
                }}>
                    <label className="block text-sm">Question
                        <textarea required maxLength={300} value={draft.question} disabled={busy} onChange={(event) => setDraft({ ...draft, question: event.target.value })} className="mt-1 block w-full rounded border p-2" />
                    </label>
                    <label className="block text-sm">Answer
                        <textarea required maxLength={2000} value={draft.answer} disabled={busy} onChange={(event) => setDraft({ ...draft, answer: event.target.value })} className="mt-1 block w-full rounded border p-2" />
                    </label>
                    <div className="flex gap-2">
                        <button type="submit" disabled={busy || !draft.question.trim() || !draft.answer.trim()} className={actionClass}>Save Card</button>
                        <button type="button" disabled={busy} onClick={() => { setDraft(null); setError(""); }} className={actionClass}>Cancel</button>
                    </div>
                </form>
            )}
            {queue === null && !draft && (
                <>
                    {!!cards.length && <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" disabled={busy} onClick={() => start(cards)} className={actionClass}>Start Review</button>
                        {!!flagged.length && <button type="button" disabled={busy} onClick={() => start(flagged)} className={actionClass}>Review Again ({flagged.length})</button>}
                    </div>}
                    {!cards.length && <p className="mt-2 text-sm text-gray-600">Turn a key idea from this note into a question and answer.</p>}
                    {!!cards.length && <details className="mt-3 text-sm">
                        <summary className="cursor-pointer">Manage Cards</summary>
                        <ul className="mt-2 divide-y">
                            {cards.map((card) => <li key={card._id} className="flex items-center justify-between gap-3 py-2">
                                <span className="break-words [overflow-wrap:anywhere]">{card.question}</span>
                                <button type="button" disabled={busy} aria-label={`Delete card: ${card.question}`} onClick={() => {
                                    if (window.confirm("Delete this flashcard?")) persist({ action: "delete", cardId: card._id }, () => {});
                                }} className="text-red-700 underline">Delete</button>
                            </li>)}
                        </ul>
                    </details>}
                </>
            )}
            {queue !== null && (
                <div className="mt-3 rounded-xl bg-[#f0f6f2] p-4">
                    {current ? <>
                        <p className="text-xs text-gray-600">{queue.length} remaining</p>
                        <p className="mt-2 whitespace-pre-wrap break-words font-semibold">{current.question}</p>
                        {revealed && <p className="mt-3 whitespace-pre-wrap break-words border-t border-[#cbd9d1] pt-3">{current.answer}</p>}
                    </> : <p role="status" className="font-semibold">Review complete.</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {current && !revealed && <button type="button" onClick={() => setRevealed(true)} className={actionClass}>Reveal Answer</button>}
                        {current && revealed && <>
                            <button type="button" disabled={busy} onClick={() => grade(true)} className={actionClass}>Review Again</button>
                            <button type="button" disabled={busy} onClick={() => grade(false)} className={actionClass}>Got It</button>
                        </>}
                        <button type="button" disabled={busy} onClick={() => setQueue(null)} className={actionClass}>{current ? "End Review" : "Back to Cards"}</button>
                    </div>
                </div>
            )}
        </section>
    );
}
