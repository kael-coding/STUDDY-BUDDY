import React, { useEffect, useState } from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
import { useTaskStore } from "../../store/taskStore";
import { useNoteStore } from "../../store/noteStore";

const Dashboard = () => {
    const { tasks, getTasks } = useTaskStore();
    const { notes, getNotes } = useNoteStore();
    const [upcomingTasks, setUpcomingTasks] = useState(0);
    const [totalNotes, setTotalNotes] = useState(0);
    const [recentActivities, setRecentActivities] = useState([]);

    // Automatically update whenever the tasks or notes change
    useEffect(() => {
        const now = new Date();

        const upcoming = tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            const [hours, minutes] = task.timeDue?.split(":") || [0, 0];
            dueDate.setHours(hours, minutes);
            return dueDate > now && task.status.toLowerCase() !== "completed";
        });
        setUpcomingTasks(upcoming.length);

        setTotalNotes(notes.length);

        const latestCompletedTasks = tasks
            .filter(task => task.status.toLowerCase() === "completed")
            .slice(-2)
            .map(task => `✅ Completed task: "${task.title}".`);

        const latestAddedTasks = tasks
            .slice(-2)
            .map(task => `📌 Added new task: "${task.title}".`);

        const latestNotes = notes
            .slice(-2)
            .map(note => `📝 Added a new note: "${note.title}".`);

        setRecentActivities([
            ...latestCompletedTasks,
            ...latestAddedTasks,
            ...latestNotes
        ].slice(-5));

    }, [tasks, notes]);

    // Initial data fetch once (populate the store)
    useEffect(() => {
        getTasks();
        getNotes();

        const interval = setInterval(() => {
            getTasks();
            getNotes();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <main className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <DashboardCard
                    title="📅 Task Scheduler"
                    subtitle={`${upcomingTasks} upcoming tasks`}
                    gradient="bg-gradient-to-r from-[#F6A6C1] to-[#F79C42]"
                />
                <DashboardCard
                    title="📖 Digital Notebook"
                    subtitle={`${totalNotes} notes created`}
                    gradient="bg-gradient-to-r from-[#D3A9F1] to-[#7A9BB6]"
                />
                <DashboardCard
                    title="👥 Community"
                    subtitle="3 new posts today"
                    gradient="bg-gradient-to-r from-[#7DE8D8] to-[#5EB1BE]"
                />
            </div>

            <div className="mt-8 bg-white p-5 rounded shadow">
                <h2 className="text-lg font-bold mb-4">Recent Activities</h2>
                <ul className="list-disc list-inside text-gray-600">
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => (
                            <li key={index}>{activity}</li>
                        ))
                    ) : (
                        <p className="text-gray-400">No recent activities.</p>
                    )}
                </ul>
            </div>
        </main>
    );
};

export default Dashboard;
