import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/notification"
    : "/api/notification";

export const useNotificationStore = create((set) => ({
    notifications: [],
    loading: false,
    error: null,

    fetchNotifications: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/all`, {
                withCredentials: true
            });
            set({ notifications: response.data, loading: false });
        } catch (error) {
            console.error("Error fetching notifications:", error);
            set({
                error: error.response?.data?.message || 'Failed to fetch notifications',
                loading: false
            });
        }
    },

    deleteNotification: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
            set(state => ({
                notifications: state.notifications.filter(n => n._id !== id)
            }));
        } catch (error) {
            console.error("Error deleting notification:", error);
            set({ error: error.message });
            throw error;
        }
    },

    markAsRead: async (id) => {
        try {
            await axios.post(`${API_URL}/markAsRead/${id}`, {}, { withCredentials: true });
            set(state => ({
                notifications: state.notifications.map(n =>
                    n._id === id ? { ...n, read: true } : n
                )
            }));
        } catch (error) {
            console.error("Error marking notification as read:", error);
            set({ error: error.message });
            throw error;
        }
    },

    markAsUnread: async (id) => {
        try {
            await axios.post(`${API_URL}/markAsUnread/${id}`, {}, { withCredentials: true });
            set(state => ({
                notifications: state.notifications.map(n =>
                    n._id === id ? { ...n, read: false } : n
                )
            }));
        } catch (error) {
            console.error("Error marking notification as unread:", error);
            set({ error: error.message });
            throw error;
        }
    }
}));