import { CheckCircle2, RotateCcw } from "lucide-react";

const secondary = "rounded-lg border border-[#cbd9d1] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[#e7f0ec] disabled:opacity-50";
const primary = "rounded-lg bg-[#346557] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#284f44] disabled:opacity-50";

export default function FlashcardPractice({ card, remaining, total, reviewAgain, revealed, busy, onReveal, onGrade, onExit }) {
    return (
        <div className="mx-auto mt-5 max-w-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#526c62]">
                <span>{card ? `Card ${total - remaining + 1} of ${total}` : `${total} of ${total} reviewed`}</span>
                <button type="button" disabled={busy} onClick={onExit} className="font-semibold text-[#346557] hover:underline">{card ? "End Review" : "Back to Cards"}</button>
            </div>
            <progress aria-label="Cards reviewed" value={total - remaining} max={total || 1}
                className="mt-2 block h-2 w-full overflow-hidden rounded-full accent-[#346557]" />
            <div className="mt-4 grid min-h-52 content-center gap-3 rounded-xl border border-[#dbe6e0] bg-[#f3f8f5] p-5 text-center sm:p-8">
                {card ? (
                    <>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#526c62]">{revealed ? "Answer" : "Question"}</p>
                        <p className="whitespace-pre-wrap text-xl font-semibold [overflow-wrap:anywhere]">{revealed ? card.answer : card.question}</p>
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="mx-auto text-[#346557]" size={30} aria-hidden="true" />
                        <p role="status" className="text-xl font-semibold">{total ? "Review complete" : "No flashcards to review"}</p>
                        {total > 0 && <p className="text-sm text-[#526c62]">{reviewAgain} marked Review Again in this session.</p>}
                    </>
                )}
            </div>
            {card && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {revealed ? (
                        <>
                            <button type="button" disabled={busy} onClick={() => onGrade(true)} className={secondary}><RotateCcw size={15} className="mr-1 inline" aria-hidden="true" /> Review Again</button>
                            <button type="button" disabled={busy} onClick={() => onGrade(false)} className={primary}>Got It</button>
                        </>
                    ) : <button type="button" onClick={onReveal} className={primary}>Reveal Answer</button>}
                </div>
            )}
        </div>
    );
}
