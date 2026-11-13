import React, { useEffect, useState } from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
import TodayTasks from "../../components/dashboard/TodayTasks.jsx";
import { groupTodayTasks } from "../../lib/utils/todayTasks.js";
import { useTaskStore } from "../../store/taskStore.js";
import { useNoteStore } from "../../store/noteStore.js";
import { useCommunityStore } from "../../store/communityStore.js"; // ✅ Import post store

const Dashboard = () => {
    const { tasks, getTasks } = useTaskStore();
    const { notes, getNotes } = useNoteStore();
    const { posts, getPosts } = useCommunityStore(); // ✅ Use post store

    const { dueToday, overdue, upcoming } = groupTodayTasks(tasks);
    const [recentActivities, setRecentActivities] = useState([]);
    const [newPostsToday, setNewPostsToday] = useState(0); // ✅ State for new posts

    const updateRecentActivities = (activity) => {
        setRecentActivities(prev => {
            if (prev.includes(activity)) return prev;
            const updated = [activity, ...prev];
            return updated.slice(0, 5);
        });
    };

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

    // Track recent activities
    useEffect(() => {
        const completed = tasks
            .filter(task => task.status.toLowerCase() === "completed")
            .map(task => `✅ Completed task: "${task.title}".`);

        const overdueActivities = groupTodayTasks(tasks).overdue
            .map(({ task }) => task)
            .map(task => `❗ Overdue task: "${task.title}".`);

        const added = tasks
            .filter(task => task.status.toLowerCase() === "pending")
            .map(task => `📌 Added new task: "${task.title}".`);

        const noteActivities = notes.map(note => `📝 Added a new note: "${note.title}".`);

        const allActivities = [...completed, ...overdueActivities, ...added, ...noteActivities];
        allActivities.slice(0, 5).forEach(updateRecentActivities);
    }, [tasks, notes]);

    // ✅ Count new posts created today
    useEffect(() => {
        const today = new Date();
        const isToday = (dateStr) => {
            const date = new Date(dateStr);
            return (
                date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate()
            );
        };

        const recentPosts = posts.filter(post => isToday(post.createdAt));
        setNewPostsToday(recentPosts.length);
    }, [posts]);

    return (
        <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <TodayTasks />
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DashboardCard
                    title="📅 Task Scheduler"
                    subtitle={`${dueToday.length + overdue.length + upcoming.length} open tasks`}
                    gradient="bg-gradient-to-r from-[#F6A6C1] to-[#F79C42]"
                />
                <DashboardCard
                    title="📖 Digital Notebook"
                    subtitle={`${notes.length} notes created`}
                    gradient="bg-gradient-to-r from-[#D3A9F1] to-[#7A9BB6]"
                />
                <DashboardCard
                    title="👥 Community"
                    subtitle={`${newPostsToday} new posts today`}
                    gradient="bg-gradient-to-r from-[#7DE8D8] to-[#5EB1BE]"
                />
            </div>

            {/* Recent Activities */}
            <div className="bg-white p-5 rounded-2xl shadow mt-8">
                <h2 className="text-lg font-bold text-gray-800 dark:text-black mb-4">
                    Recent Activities
                </h2>
                {recentActivities.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-600 dark:text-black space-y-1">
                        {recentActivities.map((activity, index) => (
                            <li key={index}>{activity}</li>
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
