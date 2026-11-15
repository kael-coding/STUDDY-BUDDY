import { Link } from "react-router-dom";
import { Radar } from "lucide-react";
import { buildReviewRadar } from "@/lib/utils/reviewRadar.js";

const deadlineFormat = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
});
const actionClass = "text-sm font-semibold text-[#346557] underline underline-offset-4";

function DeckLink({ deck }) {
    const query = new URLSearchParams({ note: deck.note._id, mode: "again" });
    return (
        <li className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-1">
            <span className="min-w-0 text-sm [overflow-wrap:anywhere]">{deck.note.title}</span>
            <Link to={`/flashcard-review?${query}`} className={actionClass}>
                Review {deck.count} {deck.count === 1 ? "card" : "cards"}
            </Link>
        </li>
    );
}

export default function ReviewRadar({ tasks, notes, loading, error }) {
    const now = new Date();
    const { assessments, otherDecks } = buildReviewRadar(tasks, notes, now);
    const hasItems = assessments.length > 0 || otherDecks.length > 0;

    return (
        <section aria-labelledby="review-radar-title" className="rounded-xl border border-[#dbe6e0] bg-[#f0f6f2] p-4 sm:p-5">
            <h2 id="review-radar-title" className="flex items-center gap-2 text-lg font-bold text-[#233e35]">
                <Radar size={20} aria-hidden="true" /> Review Radar
            </h2>
            {error && <p role="alert" className="mt-2 text-sm text-red-800">Some study data could not be loaded.</p>}
            {!hasItems && !error && (
                <p className="mt-2 text-sm text-gray-700">
                    {loading ? "Checking assessments and flashcards…" : "Add checklist topics or mark a flashcard Review Again to see it here."}
                </p>
            )}
            {!!assessments.length && (
                <>
                    <h3 className="mb-2 mt-4 text-sm font-semibold text-[#233e35]">Overdue and next 7 days</h3>
                    <ul className="grid gap-3 md:grid-cols-2">
                        {assessments.map(({ task, deadline, topics, related }) => (
                            <li key={task._id} className="min-w-0 rounded-xl border border-[#dbe6e0] bg-white p-4">
                                <h4 className="font-semibold [overflow-wrap:anywhere]">{task.title}</h4>
                                <p className="mt-1 text-sm text-gray-600">
                                    {deadline <= now.getTime() ? "Overdue · " : "Due "}
                                    <time dateTime={new Date(deadline).toISOString()}>{deadlineFormat.format(deadline)}</time>
                                </p>
                                {topics.length > 0 && (
                                    <p className="mt-2 text-sm [overflow-wrap:anywhere]">
                                        {topics.length} unfinished · <Link to={`/task-scheduler?${new URLSearchParams({ task: task._id, topic: topics[0]._id })}`} className={actionClass}>{topics[0].title}</Link>
                                    </p>
                                )}
                                {related.length > 0 && <ul className="mt-2 border-t border-[#edf2ef] pt-1">
                                    {related.map((deck) => <DeckLink key={deck.note._id} deck={deck} />)}
                                </ul>}
                            </li>
                        ))}
                    </ul>
                </>
            )}
            {!!otherDecks.length && (
                <div className="mt-4 rounded-xl border border-[#dbe6e0] bg-white p-4">
                    <h3 className="mb-2 text-sm font-semibold">Other flashcards to revisit</h3>
                    <ul>{otherDecks.map((deck) => <DeckLink key={deck.note._id} deck={deck} />)}</ul>
                </div>
            )}
        </section>
    );
}
