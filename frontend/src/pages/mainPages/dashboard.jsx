import React, { useEffect, useState } from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
import { useTaskStore } from "../../store/taskStore";
import { useNoteStore } from "../../store/noteStore";

const Dashboard = () => {
    const { tasks = [], getTasks } = useTaskStore();
    const { notes = [], getNotes } = useNoteStore();
    const [upcomingTasks, setUpcomingTasks] = useState(0);
    const [totalNotes, setTotalNotes] = useState(0);
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            await getTasks();
            const now = new Date();
            const upcoming = tasks.filter(task => {
                const dueDate = new Date(task.dueDate);
                const [hours, minutes] = task.timeDue.split(":");
                dueDate.setHours(hours, minutes);
                return dueDate > now && task.status.toLowerCase() !== "completed";
            });
            setUpcomingTasks(upcoming.length);
        };

        const fetchNotes = async () => {
            await getNotes();
            setTotalNotes(notes.length);
        };

        const fetchRecentActivities = () => {
            const latestCompletedTasks = tasks
                .filter(task => task.status.toLowerCase() === "completed")
                .slice(-2) // Get last 2 completed tasks
                .map(task => `✅ Completed task: "${task.title}".`);

            const latestAddedTasks = tasks
                .slice(-2) // Get last 2 added tasks
                .map(task => `📌 Added new task: "${task.title}".`);

            const latestNotes = notes
                .slice(-2) // Get last 2 notes
                .map(note => `📝 Added a new note: "${note.title}".`);

            // Combine all recent activities and keep only the latest 5
            setRecentActivities([...latestCompletedTasks, ...latestAddedTasks, ...latestNotes].slice(-5));
        };

        fetchTasks();
        fetchNotes();
        fetchRecentActivities();

        const interval = setInterval(() => {
            fetchTasks();
            fetchNotes();
            fetchRecentActivities();
        }, 30000);

        return () => clearInterval(interval);
    }, [tasks, notes]);

    return (
        <main className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <DashboardCard
                    title="📅 Task Scheduler"
                    subtitle={`${upcomingTasks} upcoming tasks`}
                    bgColor="bg-blue-100"
                />
                <DashboardCard
                    title="📖 Digital Notebook"
                    subtitle={`${totalNotes} notes created`}
                    bgColor="bg-green-100"
                />
                <DashboardCard title="👥 Community" subtitle="3 new posts today" bgColor="bg-purple-100" />
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
