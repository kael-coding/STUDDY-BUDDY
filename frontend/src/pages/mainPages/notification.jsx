import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import NotificationRow from "@/components/quickAccess/NotificationRow.jsx";
import { categoryFor } from "@/components/quickAccess/notificationCategory.js";
import ViewFilters from "@/components/quickAccess/ViewFilters.jsx";
import { useNotificationStore } from "@/store/notificationStore.js";
import { useAuthStore } from "@/store/authStore.js";

const filters = [["all", "All"], ["tasks", "Tasks"], ["community", "Community"], ["reports", "Reports"]];

export default function Notifications() {
    const { notifications, fetchNotifications, markAsRead, markAsUnread, markAllAsRead, deleteNotification, loading, error } = useNotificationStore();
    const socket = useAuthStore((state) => state.socket);
    const [tab, setTab] = useState("all");
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState("");
    const visible = notifications.filter((item) => tab === "all" || categoryFor(item) === tab);
    const [selected, setSelected] = useState([]);
    const selectedIds = visible.filter((item) => selected.includes(item._id)).map((item) => item._id);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30_000);
        socket?.on("notifications:changed", fetchNotifications);
        socket?.on("connect", fetchNotifications);
        return () => {
            clearInterval(interval);
            socket?.off("notifications:changed", fetchNotifications);
            socket?.off("connect", fetchNotifications);
        };
    }, [fetchNotifications, socket]);

    const run = async (action) => {
        if (busy) return;
        setBusy(true);
        setActionError("");
        try {
            await action();
        } catch (requestError) {
            setActionError(requestError.response?.data?.message || "Could not update notifications. Try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="max-w-3xl space-y-5 py-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="mt-1 text-sm text-[#526c62]">Stay up to date with your tasks, community activity, and reports.</p>
                </div>
                <button type="button" disabled={busy || !notifications.some((item) => !item.read)} onClick={() => run(markAllAsRead)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-sm font-semibold text-[#346557] hover:bg-[#e7f0ec] disabled:opacity-50">
                    <CheckCheck size={17} aria-hidden="true" /> Mark all read
                </button>
            </header>
            <ViewFilters label="Notification type" options={filters} value={tab} onChange={(value) => { setTab(value); setSelected([]); }} />
            {error && <p role="alert" className="text-sm text-red-700">{error} <button type="button" className="underline" onClick={fetchNotifications}>Retry</button></p>}
            {actionError && <p role="alert" className="text-sm text-red-700">{actionError}</p>}
            <div className="overflow-hidden rounded-xl border border-[#dce7e1] bg-white">
                {visible.length ? (
                    <>
                        <div className="flex min-h-11 items-center justify-between gap-2 border-b border-[#dce7e1] px-4 py-2 text-xs text-[#526c62]">
                            <label className="flex items-center gap-2"><input type="checkbox" disabled={busy}
                                checked={selectedIds.length === visible.length}
                                onChange={(event) => setSelected(event.target.checked ? visible.map((item) => item._id) : [])} /> Select visible</label>
                            {selectedIds.length > 0 && <button type="button" disabled={busy} className="font-semibold text-red-700 hover:underline"
                                onClick={() => run(async () => {
                                    const results = await Promise.allSettled(selectedIds.map(deleteNotification));
                                    setSelected(selectedIds.filter((_, index) => results[index].status === "rejected"));
                                    if (results.some(({ status }) => status === "rejected")) throw new Error("Delete failed");
                                })}>Delete selected ({selectedIds.length})</button>}
                        </div>
                        <ul className="divide-y divide-[#dce7e1]">
                            {visible.map((item) => <NotificationRow key={item._id} item={item} disabled={busy} selected={selected.includes(item._id)}
                                onSelect={() => setSelected((ids) => ids.includes(item._id) ? ids.filter((id) => id !== item._id) : [...ids, item._id])}
                                onToggle={() => run(() => (item.read ? markAsUnread : markAsRead)(item._id))}
                                onDelete={() => run(() => deleteNotification(item._id))} />)}
                        </ul>
                    </>
                ) : (
                    <div className="p-8 text-center">
                        <Bell size={24} className="mx-auto mb-2 text-[#346557]" aria-hidden="true" />
                        <p role="status" className="text-sm font-semibold">{loading ? "Loading notifications…" : error ? "Notifications unavailable" : "No notifications in this view"}</p>
                    </div>
                )}
            </div>
        </section>
    );
}
