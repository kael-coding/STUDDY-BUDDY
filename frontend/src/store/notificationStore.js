import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore.js";

const api = "/api/notification";
let latestRequest = 0;
let accountVersion = 0;

export const useNotificationStore = create((set) => {
    const mutate = async (request, update) => {
        const version = accountVersion;
        await request();
        if (version !== accountVersion) return;
        latestRequest++;
        set((state) => ({ notifications: update(state.notifications), loading: false, error: null }));
    };

    const mark = (id, read) => mutate(
        () => axios.post(`${api}/${read ? "markAsRead" : "markAsUnread"}/${encodeURIComponent(id)}`),
        (items) => items.map((item) => item._id === id ? { ...item, read } : item),
    );

    return {
        notifications: [],
        loading: false,
        error: null,
        fetchNotifications: async () => {
            const request = ++latestRequest;
            set({ loading: true, error: null });
            try {
                const { data } = await axios.get(`${api}/all`);
                if (request === latestRequest) set({ notifications: data, loading: false });
            } catch (error) {
                if (request === latestRequest) set({ error: error.response?.data?.message || "Could not load notifications.", loading: false });
            }
        },
        deleteNotification: (id) => mutate(
            () => axios.delete(`${api}/${encodeURIComponent(id)}`),
            (items) => items.filter((item) => item._id !== id),
        ),
        markAsRead: (id) => mark(id, true),
        markAsUnread: (id) => mark(id, false),
        markAllAsRead: () => mutate(
            () => axios.post(`${api}/mark-all-read`),
            (items) => items.map((item) => ({ ...item, read: true })),
        ),
    };
});

useAuthStore.subscribe((state, previous) => {
    if (state.user?._id === previous.user?._id) return;
    accountVersion++;
    latestRequest++;
    useNotificationStore.setState({ notifications: [], loading: false, error: null });
});
