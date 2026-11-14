import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import ContinueStudying from "@/components/dashboard/ContinueStudying.jsx";
import FocusSessions from "@/components/dashboard/FocusSessions.jsx";
import QuickAccess from "@/components/dashboard/QuickAccess.jsx";
import ReviewRadar from "@/components/dashboard/ReviewRadar.jsx";
import TodayTasks from "@/components/dashboard/TodayTasks.jsx";
import LinkedNote from "@/components/LinkedNote.jsx";
import { groupTodayTasks, manilaDateKey, taskIsComplete } from "@/lib/utils/todayTasks.js";
import { useAuthStore } from "@/store/authStore.js";
import { useCommunityStore } from "@/store/communityStore.js";
import { useNoteStore } from "@/store/noteStore.js";
import { useTaskStore } from "@/store/taskStore.js";

const dashboardDate = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "full",
});

const dashboardHour = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    hourCycle: "h23",
});

export default function Dashboard() {
    const { tasks, getTasks, isLoading: loadingTasks, error: tasksError } = useTaskStore();
    const { notes, getNotes, isLoading: loadingNotes, error: notesError } = useNoteStore();
    const { posts, getPosts } = useCommunityStore();
    const user = useAuthStore((state) => state.user);
    const [viewingNote, setViewingNote] = useState(null);
    const [now, setNow] = useState(() => new Date());

    const today = manilaDateKey(now);
    const hour = Number(dashboardHour.format(now));
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const groups = groupTodayTasks(tasks, now);
    const { overdue, dueToday, upcoming } = groups;
    const openTasks = tasks.filter((task) => !task.isArchived && !taskIsComplete(task));
    const next = (overdue[0] ?? dueToday[0] ?? upcoming[0])?.task ?? openTasks[0];
    const reviewer = notes.find((note) => note._id === next?.noteId);
    const newPostsToday = posts.filter(({ createdAt }) => {
        const timestamp = Date.parse(createdAt);
        return Number.isFinite(timestamp) && manilaDateKey(timestamp) === today;
    }).length;
    const recentActivities = [
        ...tasks.map((task) => ({
            key: `task-${task._id}`,
            date: task.updatedAt || task.createdAt,
            text: `${taskIsComplete(task) ? "Completed task" : "Task"} · ${task.title}`,
        })),
        ...notes.map((note) => ({
            key: `note-${note._id}`,
            date: note.updatedAt || note.createdAt,
            text: `Note · ${note.title}`,
        })),
    ].filter(({ date }) => Number.isFinite(Date.parse(date)))
        .sort((first, second) => Date.parse(second.date) - Date.parse(first.date))
        .slice(0, 5);

    useEffect(() => {
        const refresh = () => {
            setNow(new Date());
            getTasks();
            getNotes();
            getPosts();
        };
        refresh();
        const interval = setInterval(refresh, 30_000);
        return () => clearInterval(interval);
    }, [getTasks, getNotes, getPosts, user?._id]);

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-4 sm:px-2 sm:py-3 md:px-4 md:py-4">
            {viewingNote && <LinkedNote noteId={viewingNote} onClose={() => setViewingNote(null)} />}
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight text-[#233e35] [overflow-wrap:anywhere] sm:text-3xl">
                        {greeting}{user?.userName ? `, ${user.userName}` : ""}
                    </h1>
                    <p className="mt-1 text-sm text-[#526c62]">Here’s what you can focus on today.</p>
                </div>
                <time dateTime={today} className="inline-flex items-center gap-2 rounded-lg border border-[#dbe6e0] bg-white px-3 py-2 text-sm text-[#526c62]">
                    <CalendarDays size={16} aria-hidden="true" />
                    {dashboardDate.format(now)}
                </time>
            </header>

            <ContinueStudying assessment={next} reviewer={reviewer} loading={loadingTasks} error={tasksError} onOpenReviewer={setViewingNote} />

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
                <div className="min-w-0 space-y-5">
                    <TodayTasks groups={groups} />
                    <ReviewRadar tasks={tasks} notes={notes} loading={loadingTasks || loadingNotes} error={tasksError || notesError} />
                </div>
                <div className="min-w-0 space-y-4">
                    <QuickAccess taskCount={openTasks.length} noteCount={notes.length} newPostCount={newPostsToday} />
                    <FocusSessions key={user?._id} task={next} />
                    <section aria-labelledby="recent-activity-title" className="rounded-xl border border-[#dbe6e0] bg-white p-4">
                        <h2 id="recent-activity-title" className="font-semibold text-[#233e35]">Recently Updated</h2>
                        {recentActivities.length ? (
                            <ul className="mt-2 divide-y divide-[#edf2ef] text-sm text-[#526c62]">
                                {recentActivities.map(({ key, text }) => (
                                    <li key={key} className="py-2 [overflow-wrap:anywhere]">{text}</li>
                                ))}
                            </ul>
                        ) : <p className="mt-2 text-sm text-[#526c62]">No recent activity.</p>}
                    </section>
                </div>
            </div>
        </div>
    );
}
