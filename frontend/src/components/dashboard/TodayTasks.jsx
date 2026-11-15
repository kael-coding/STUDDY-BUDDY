import { useState } from "react";
import { CalendarDays, Check, Clock3, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTaskStore } from "@/store/taskStore.js";
import LinkedNote from "@/components/LinkedNote.jsx";

const sections = [
    { key: "dueToday", title: "Due Today", icon: <Clock3 size={17} aria-hidden="true" />, color: "text-amber-800", empty: "Nothing else due today." },
    { key: "overdue", title: "Overdue", icon: <TriangleAlert size={17} aria-hidden="true" />, color: "text-red-700", empty: "No overdue tasks." },
    { key: "upcoming", title: "Upcoming", icon: <CalendarDays size={17} aria-hidden="true" />, color: "text-[#346557]", empty: "No upcoming tasks." },
];

const deadlineFormat = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
});

export default function TodayTasks({ groups }) {
    const { tasks, isLoading, isUpdatingTask, error, updateTask } = useTaskStore();
    const [completingId, setCompletingId] = useState(null);
    const [viewingNote, setViewingNote] = useState(null);

    const markDone = async (taskId) => {
        setCompletingId(taskId);
        const updated = await updateTask(taskId, { status: "completed" });
        setCompletingId(null);
        if (updated) toast.success("Task marked as done.");
        else toast.error("Could not mark the task as done. Try again.");
    };

    return (
        <section aria-labelledby="today-title">
            {viewingNote && <LinkedNote noteId={viewingNote} onClose={() => setViewingNote(null)} />}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 id="today-title" className="text-lg font-semibold text-[#233e35]">Assessments</h2>
                <Link to="/task-scheduler" className="text-sm font-semibold text-[#346557] underline underline-offset-4">
                    Open Study Planner
                </Link>
            </div>
            {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
            {isLoading && tasks.length === 0 ? (
                <p role="status" className="text-sm text-gray-600">Loading tasks…</p>
            ) : (
                <div className="grid gap-3">
                    {sections.map(({ key, title, icon, color, empty }) => (
                        <section key={key} className="rounded-xl border border-[#dbe6e0] bg-white p-4">
                            <h3 className={`flex items-center gap-2 font-semibold ${color}`}>
                                {icon}
                                {title}
                            </h3>
                            {groups[key].length ? (
                                <ul className="mt-2 divide-y divide-gray-100">
                                    {groups[key].map(({ task, deadline }) => (
                                        <li key={task._id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                                            <div className="min-w-0">
                                                <Link to={`/task-scheduler?${new URLSearchParams({ task: task._id })}`}
                                                    className="block font-medium text-[#233e35] hover:underline [overflow-wrap:anywhere]">
                                                    {task.title}
                                                </Link>
                                                <time dateTime={new Date(deadline).toISOString()} className="text-sm text-gray-600">
                                                    {deadlineFormat.format(deadline)}
                                                </time>
                                                {task.noteId && (
                                                    <button type="button" onClick={() => setViewingNote(task.noteId)}
                                                        className="mt-1 block text-sm font-medium text-[#346557] underline">
                                                        Open Linked Note
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                aria-label={`Mark ${task.title} as done`}
                                                disabled={isUpdatingTask || completingId !== null}
                                                onClick={() => markDone(task._id)}
                                                className="inline-flex items-center gap-1 rounded-lg bg-[#e5f1eb] px-2.5 py-1.5 text-sm font-semibold text-[#295547] hover:bg-[#d3e8dd] disabled:opacity-60"
                                            >
                                                <Check size={15} aria-hidden="true" />
                                                {completingId === task._id ? "Saving…" : "Mark as Done"}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="mt-3 text-sm text-gray-600">{empty}</p>}
                        </section>
                    ))}
                </div>
            )}
        </section>
    );
}
