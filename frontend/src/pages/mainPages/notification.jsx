import { useEffect, useState } from "react";
import { useNotificationStore } from "../../store/notificationStore.js";

const typeDetails = {
    reminder: { icon: "📅", message: "You have a task reminder." },
    overDue: { icon: "⚠️", message: "A task is overdue!" },
    completed: { icon: "✅", message: "A task has been completed." },
    like: { icon: "❤️", message: "Someone liked your post." },
    comment: { icon: "💬", message: "Someone commented on your post." },
    reply: { icon: "↩️", message: "Someone replied to your comment." },
    likeComment: { icon: "👍", message: "Someone liked your comment." }
};

export default function Notifications() {
    const {
        notifications,
        fetchNotifications,
        markAsRead,
        deleteNotification,
        loading,
        error
    } = useNotificationStore();

    const [selected, setSelected] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(notifications.map((_, i) => i));
        } else {
            setSelected([]);
        }
    };

    const toggleSelect = (index) => {
        setSelected(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const deleteSelected = async () => {
        const ids = selected.map(i => notifications[i]._id);
        for (const id of ids) {
            await deleteNotification(id);
        }
        setSelected([]);
    };

    const handleMarkRead = async (index) => {
        const notif = notifications[index];
        if (!notif.read) {
            await markAsRead(notif._id);
        }
    };

    return (
        <main className="p-6 max-w-4xl mx-auto">
            <div className="bg-gray-300 shadow rounded p-5">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={selected.length === notifications.length && notifications.length > 0}
                            onChange={toggleSelectAll}
                            className="cursor-pointer"
                        />
                        <label className="text-sm text-gray-600 cursor-pointer">Select All</label>
                    </div>
                    <button
                        onClick={deleteSelected}
                        className="bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                        disabled={selected.length === 0}
                    >
                        Delete Selected
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-10">⏳ Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-500 py-10">{error}</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">🚫 No notifications</div>
                ) : (
                    <ul className="space-y-3">
                        {notifications.map((notif, index) => {
                            const { icon, message } = typeDetails[notif.type] || {};
                            return (
                                <li
                                    key={notif._id}
                                    className={`${!notif.read ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-100'} p-4 rounded shadow flex justify-between items-start`}
                                >
                                    <div className="flex items-start gap-3 w-full">
                                        <input
                                            type="checkbox"
                                            className="mt-1"
                                            checked={selected.includes(index)}
                                            onChange={() => toggleSelect(index)}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {icon || "🔔"} {message || notif.type}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Created: {new Date(notif.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleMarkRead(index)}
                                            className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                                        >
                                            {notif.read ? "Read" : "Mark as Read"}
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </main>
    );
}
