import { useEffect, useState } from "react";
import { CalendarDays, Check, Clock3, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTaskStore } from "../../store/taskStore.js";
import { groupTodayTasks } from "../../lib/utils/todayTasks.js";
import LinkedNote from "../LinkedNote.jsx";

const sections = [
    { key: "dueToday", title: "Due Today", Icon: Clock3, color: "text-amber-800", empty: "Nothing else due today." },
    { key: "overdue", title: "Overdue", Icon: TriangleAlert, color: "text-red-700", empty: "No overdue tasks." },
    { key: "upcoming", title: "Upcoming", Icon: CalendarDays, color: "text-[#346557]", empty: "No upcoming tasks." },
];

const deadlineFormat = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
});

export default function TodayTasks() {
    const { tasks, isLoading, isUpdatingTask, error, updateTask } = useTaskStore();
    const [now, setNow] = useState(() => new Date());
    const [completingId, setCompletingId] = useState(null);
    const [viewingNote, setViewingNote] = useState(null);
    const groups = groupTodayTasks(tasks, now);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 30_000);
        return () => clearInterval(interval);
    }, []);

    const markDone = async (taskId) => {
        setCompletingId(taskId);
        const updated = await updateTask(taskId, { status: "completed" });
        setCompletingId(null);
        if (updated) toast.success("Task marked as done.");
        else toast.error("Could not mark the task as done. Try again.");
    };

    return (
        <section aria-labelledby="today-title" className="mb-8 rounded-2xl border border-[#dbe6e0] bg-[#f3f7f5] p-4 sm:p-6">
            {viewingNote && <LinkedNote noteId={viewingNote} onClose={() => setViewingNote(null)} />}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 id="today-title" className="text-2xl font-bold text-[#233e35]">Today</h2>
                <Link to="/task-scheduler" className="text-sm font-semibold text-[#346557] underline underline-offset-4">
                    Open Task Scheduler
                </Link>
            </div>
            {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
            {isLoading && tasks.length === 0 ? (
                <p role="status" className="text-sm text-gray-600">Loading tasks…</p>
            ) : (
                <div className="grid gap-3 lg:grid-cols-3">
                    {sections.map(({ key, title, Icon, color, empty }) => (
                        <section key={key} className="rounded-xl border border-[#dbe6e0] bg-white p-4">
                            <h3 className={`flex items-center gap-2 font-semibold ${color}`}>
                                <Icon size={17} aria-hidden="true" />
                                {title}
                            </h3>
                            {groups[key].length ? (
                                <ul className="mt-2 divide-y divide-gray-100">
                                    {groups[key].map(({ task, deadline }) => (
                                        <li key={task._id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                                            <div className="min-w-0">
                                                <p className="break-words font-medium text-gray-900">{task.title}</p>
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
