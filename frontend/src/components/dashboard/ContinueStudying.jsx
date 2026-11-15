import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function ContinueStudying({ assessment, reviewer, loading, error, onOpenReviewer }) {
    const topics = assessment?.topics ?? [];
    const nextTopic = topics.find((topic) => !topic.done);
    const completed = topics.filter((topic) => topic.done).length;
    const progress = topics.length ? Math.round(completed / topics.length * 100) : 0;
    const plannerLink = assessment ? `/task-scheduler?${new URLSearchParams({
        task: assessment._id,
        ...(nextTopic && { topic: nextTopic._id }),
    })}` : "/task-scheduler";

    return (
        <section aria-labelledby="continue-studying-title" className="grid items-center gap-5 rounded-xl bg-[#346557] p-5 text-white sm:p-6 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
                <h2 id="continue-studying-title" className="text-sm font-semibold text-[#e1f0e9]">Start Studying</h2>
                {assessment ? (
                    <>
                        <p className="mt-1 text-2xl font-semibold tracking-tight [overflow-wrap:anywhere]">{assessment.title}</p>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#e1f0e9] [overflow-wrap:anywhere]">
                            {nextTopic && <span>Current topic: {nextTopic.title}</span>}
                            {reviewer && <span>Reviewer: {reviewer.title}</span>}
                        </div>
                        {topics.length > 0 && (
                            <div className="mt-4 max-w-md">
                                <div className="mb-1.5 flex flex-wrap justify-between gap-x-3 text-xs text-[#e1f0e9]">
                                    <span>{completed} of {topics.length} topics completed</span>
                                    <span>{progress}%</span>
                                </div>
                                <progress aria-label="Assessment topic progress" value={completed} max={topics.length}
                                    className="block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-white/25 [&::-moz-progress-bar]:bg-white [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-white"
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <p className="mt-2 text-sm" role={error ? "alert" : "status"}>
                        {error ? "Could not load your next assessment." : loading ? "Loading assessments…" : "You have no open assessments."}
                    </p>
                )}
            </div>
            <div className="flex flex-wrap gap-2 md:flex-col">
                <Link to={plannerLink} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#294f43] hover:bg-[#e7f0ec]">
                    {assessment ? "Continue Studying" : "Open Study Planner"}
                    <ArrowRight size={16} aria-hidden="true" />
                </Link>
                {assessment?.noteId && (
                    <button type="button" onClick={() => onOpenReviewer(assessment.noteId)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/60 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">
                        <BookOpen size={16} aria-hidden="true" />
                        Open Reviewer
                    </button>
                )}
            </div>
        </section>
    );
}
