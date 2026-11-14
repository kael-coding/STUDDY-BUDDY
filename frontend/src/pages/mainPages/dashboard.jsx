import { useEffect, useState } from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
import TodayTasks from "../../components/dashboard/TodayTasks.jsx";
import { groupTodayTasks, manilaDateKey, taskIsComplete } from "../../lib/utils/todayTasks.js";
import { useTaskStore } from "../../store/taskStore.js";
import { useNoteStore } from "../../store/noteStore.js";
import { useCommunityStore } from "../../store/communityStore.js";
import { Link } from "react-router-dom";
import LinkedNote from "../../components/LinkedNote.jsx";
import FocusSessions from "../../components/dashboard/FocusSessions.jsx";
import ReviewRadar from "../../components/dashboard/ReviewRadar.jsx";
import { useAuthStore } from "../../store/authStore.js";

const Dashboard = () => {
    const { tasks, getTasks, isLoading: loadingTasks, error: tasksError } = useTaskStore();
    const { notes, getNotes, isLoading: loadingNotes, error: notesError } = useNoteStore();
    const { posts, getPosts } = useCommunityStore();
    const [viewingNote, setViewingNote] = useState(null);
    const accountId = useAuthStore((state) => state.user?._id);

    const { dueToday, overdue, upcoming } = groupTodayTasks(tasks);
    const next = [...overdue, ...dueToday, ...upcoming][0]?.task
        || tasks.find((task) => !task.isArchived && !taskIsComplete(task));
    const nextTopic = next?.topics?.find((topic) => !topic.done);
    const assessmentLink = next && `/task-scheduler?${new URLSearchParams({
        task: next._id,
        ...(nextTopic && { topic: nextTopic._id }),
    })}`;
    const today = manilaDateKey(new Date());
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

    // Fetch data on mount and every 30s
    useEffect(() => {
        getTasks();
        getNotes();
        getPosts();

        const interval = setInterval(() => {
            getTasks();
            getNotes();
            getPosts();
        }, 30000);

        return () => clearInterval(interval);
    }, [getTasks, getNotes, getPosts]);

    return (
        <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {viewingNote && <LinkedNote noteId={viewingNote} onClose={() => setViewingNote(null)} />}
            <section className="mb-6 rounded-2xl border border-[#dbe6e0] bg-white p-5">
                <h1 className="text-2xl font-bold text-[#233e35]">Start Studying</h1>
                {next ? (
                    <div className="mt-3">
                        <p className="text-lg font-semibold [overflow-wrap:anywhere]">{nextTopic?.title || next.title}</p>
                        {nextTopic && <p className="text-sm text-gray-600">{next.title}</p>}
                        <div className="mt-3 flex flex-wrap gap-3">
                            <Link to={assessmentLink} className="rounded-lg bg-[#346557] px-3 py-2 text-sm font-semibold text-white">{nextTopic ? "Open Topic" : "Open Assessment"}</Link>
                            {next.noteId && <button type="button" onClick={() => setViewingNote(next.noteId)} className="rounded-lg border border-[#cbd9d1] px-3 py-2 text-sm font-semibold text-[#346557]">Open Reviewer</button>}
                        </div>
                    </div>
                ) : <p className="mt-2 text-sm text-gray-600">
                    {loadingTasks ? "Loading tasks…" : tasksError ? "Could not load your next task." : "No open tasks."}{" "}
                    <Link to="/task-scheduler" className="underline">Open Study Planner</Link>.
                </p>}
            </section>
            <ReviewRadar tasks={tasks} notes={notes} loading={loadingTasks || loadingNotes} error={tasksError || notesError} />
            <FocusSessions key={accountId} task={next} />
            <TodayTasks />
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DashboardCard
                    to="/task-scheduler"
                    title="📅 Study Planner"
                    subtitle={`${dueToday.length + overdue.length + upcoming.length} open tasks`}
                    gradient="bg-gradient-to-r from-[#F6A6C1] to-[#F79C42]"
                />
                <DashboardCard
                    to="/digital-notebook"
                    title="📖 Study Library"
                    subtitle={`${notes.length} notes created`}
                    gradient="bg-gradient-to-r from-[#D3A9F1] to-[#7A9BB6]"
                />
                <DashboardCard
                    to="/community"
                    title="👥 Study Groups"
                    subtitle={`${newPostsToday} new posts today`}
                    gradient="bg-gradient-to-r from-[#7DE8D8] to-[#5EB1BE]"
                />
            </div>

            {/* Recent Activities */}
            <div className="bg-white p-5 rounded-2xl shadow mt-8">
                <h2 className="text-lg font-bold text-gray-800 dark:text-black mb-4">
                    Recently Updated
                </h2>
                {recentActivities.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-600 dark:text-black space-y-1">
                        {recentActivities.map(({ key, text }) => (
                            <li key={key}>{text}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No recent activities.</p>
                )}
            </div>
        </main>
    );
};

export default Dashboard;
