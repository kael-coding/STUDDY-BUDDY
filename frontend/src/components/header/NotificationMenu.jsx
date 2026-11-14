import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotificationStore } from "@/store/notificationStore.js";

const typeIcons = {
    reminder: "📅", overDue: "⚠️", completed: "✅", like: "❤️", comment: "💬", likeComment: "👍",
};

export default function NotificationMenu() {
    const [open, setOpen] = useState(false);
    const trigger = useRef(null);
    const { notifications, fetchNotifications, markAsRead, markAsUnread, deleteNotification, loading, error } = useNotificationStore();
    const unread = notifications.filter((item) => !item.read).length;

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30_000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return (
        <div onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }} onKeyDown={(event) => {
            if (event.key === "Escape" && open) {
                setOpen(false);
                trigger.current?.focus();
            }
        }}>
            <button ref={trigger} type="button" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
                aria-expanded={open} className="relative grid size-9 place-items-center rounded-lg text-[#526c62] hover:bg-[#e7f0ec]"
                onClick={() => {
                    if (!open) fetchNotifications();
                    setOpen(!open);
                }}>
                <Bell size={20} aria-hidden="true" />
                {unread > 0 && <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#b94141] ring-2 ring-white" />}
            </button>
            {open && (
                <div className="absolute right-3 top-full mt-1 flex max-h-[min(28rem,70dvh)] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-xl border border-[#dce7e1] bg-white shadow-lg sm:right-6 lg:right-8">
                    <div className="flex shrink-0 items-center justify-between border-b border-[#dce7e1] px-4 py-3 font-semibold">
                        <span>Notifications</span>
                        {!!unread && <span className="text-xs text-[#526c62]">{unread} unread</span>}
                    </div>
                    {error && <p role="alert" className="px-4 py-2 text-sm text-red-700">{error}</p>}
                    <ul className="min-h-0 flex-1 divide-y divide-[#dce7e1] overflow-y-auto">
                        {notifications.map((item) => (
                            <li key={item._id} className={`px-4 py-3 text-sm ${item.read ? "bg-white" : "bg-[#edf5f1]"}`}>
                                <div className="flex items-start gap-2">
                                    <span aria-hidden="true">{typeIcons[item.type] || "🔔"}</span>
                                    <div className="min-w-0 [overflow-wrap:anywhere]">
                                        <p className="font-medium">{item.text}</p>
                                        {item.context && <p className="text-xs text-[#526c62]">{item.context}</p>}
                                        <p className="mt-1 text-xs text-[#526c62]">{new Date(item.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-end gap-3 text-xs font-medium">
                                    <button type="button" className="text-[#365e53] hover:underline" onClick={async () => {
                                        try {
                                            await (item.read ? markAsUnread : markAsRead)(item._id);
                                        } catch {
                                            // The notification store shows the error.
                                        }
                                    }}>{item.read ? "Mark as unread" : "Mark as read"}</button>
                                    <button type="button" className="text-red-700 hover:underline" onClick={async () => {
                                        try {
                                            await deleteNotification(item._id);
                                            trigger.current?.focus();
                                        } catch {
                                            // The notification store shows the error.
                                        }
                                    }}>Delete</button>
                                </div>
                            </li>
                        ))}
                        {!notifications.length && !error && <li className="px-4 py-3 text-sm text-[#526c62]">{loading ? "Loading notifications…" : "No notifications."}</li>}
                    </ul>
                    <Link to="/notifications" onClick={() => setOpen(false)} className="shrink-0 border-t border-[#dce7e1] px-4 py-3 text-sm font-semibold text-[#365e53] hover:bg-[#e7f0ec]">
                        View all notifications
                    </Link>
                </div>
            )}
        </div>
    );
}
