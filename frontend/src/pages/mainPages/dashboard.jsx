import React, { useEffect, useState } from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
import { useTaskStore } from "../../store/taskStore";
import { useNoteStore } from "../../store/noteStore";

const Dashboard = () => {
    const { tasks, getTasks, addTask, updateTask, deleteTask } = useTaskStore();
    const { notes, getNotes, addNote, deleteNote } = useNoteStore();
    const [upcomingTasks, setUpcomingTasks] = useState(0);
    const [totalNotes, setTotalNotes] = useState(0);
    const [recentActivities, setRecentActivities] = useState([]);

    // Update recent activities - keep last 5, no duplicates
    const updateRecentActivities = (activity) => {
        setRecentActivities(prevActivities => {
            // Check if activity already exists
            if (prevActivities.includes(activity)) return prevActivities;
            // Add to top, and slice to only keep 5
            const updated = [activity, ...prevActivities];
            return updated.slice(0, 5);
        });
    };

    // Update task and note stats
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
    }, [tasks, notes]);

    // Fetch tasks & notes initially and on interval
    useEffect(() => {
        getTasks();
        getNotes();

        const interval = setInterval(() => {
            getTasks();
            getNotes();
        }, 30000);

        return () => clearInterval(interval);
    }, [getTasks, getNotes]);

    // Automatically detect new activities
    useEffect(() => {
        const now = new Date();

        const completed = tasks
            .filter(task => task.status.toLowerCase() === "completed")
            .map(task => `✅ Completed task: "${task.title}".`);

        const overdue = tasks
            .filter(task => {
                const dueDate = new Date(task.dueDate);
                const [hours, minutes] = task.timeDue?.split(":") || [0, 0];
                dueDate.setHours(hours, minutes);
                return task.status.toLowerCase() !== "completed" && dueDate < now;
            })
            .map(task => `❗ Overdue task: "${task.title}".`);

        const added = tasks
            .filter(task => task.status.toLowerCase() === "pending")
            .map(task => `📌 Added new task: "${task.title}".`);

        const noteActivities = notes.map(note => `📝 Added a new note: "${note.title}".`);

        const allActivities = [
            ...completed,
            ...overdue,
            ...added,
            ...noteActivities,
        ];

        allActivities.slice(0, 5).forEach(updateRecentActivities);
    }, [tasks, notes]);

    // Actions
    const handleAddTask = () => {
        const newTask = {
            title: "New Task",
            dueDate: new Date(),
            timeDue: "12:00",
            status: "pending",
        };
        addTask(newTask);
        updateRecentActivities(`📌 Added new task: "${newTask.title}".`);
    };

    const handleAddNote = () => {
        const newNote = { title: "New Note", content: "This is a note." };
        addNote(newNote);
        updateRecentActivities(`📝 Added a new note: "${newNote.title}".`);
    };

    const handleCompleteTask = (taskId) => {
        const task = tasks.find(t => t._id === taskId);
        if (task && task.status !== "completed") {
            updateTask(taskId, { status: "completed" });
            updateRecentActivities(`✅ Completed task: "${task.title}".`);
        }
    };

    const handleDeleteTask = (taskId) => {
        const task = tasks.find(t => t._id === taskId);
        deleteTask(taskId);
        if (task) {
            updateRecentActivities(`❌ Deleted task: "${task.title}".`);
        }
    };

    const handleDeleteNote = (noteId) => {
        const note = notes.find(n => n._id === noteId);
        deleteNote(noteId);
        if (note) {
            updateRecentActivities(`❌ Deleted note: "${note.title}".`);
        }
    };

    return (
        <main className="p-5">
            {/* Dashboard Cards */}
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

            {/* Recent Activities Section */}
            <div className="bg-white p-5 rounded shadow mb-8 mt-6">
                <h2 className="text-lg font-bold mb-4">Recent Activities</h2>
                {recentActivities.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
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
