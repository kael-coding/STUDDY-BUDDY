import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/archieve"
    : "/api/archieve";

export const useArchieveStore = create((set) => ({
    archieve: { tasks: [], notes: [] },
    isLoading: false,
    error: null,

    getArchiveTask: async () => {
        set({ isLoading: true });
        try {
            const res = await axios.get(`${API_URL}/all`);
            set({ archieve: res.data.archived, isLoading: false });
        } catch (error) {
            console.error("Error fetching archived tasks:", error);
            set({ error: "Error fetching archived tasks", isLoading: false });
        }
    },

    archieveNote: async (id) => {
        set({ isLoading: true });
        try {
            const res = await axios.put(`${API_URL}/note/archive/${id}`);
            set({ archieve: res.data.archived, isLoading: false });
        } catch (error) {
            console.error("Error fetching archived notes:", error);
            set({ error: "Error fetching archived notes", isLoading: false });
        }
    },

    unarchiveNote: async (id) => {
        set({ isLoading: true });
        try {
            const res = await axios.put(`${API_URL}/note/unarchive/${id}`);
            set({ archieve: res.data.archived, isLoading: false });
        } catch (error) {
            console.error("Error unarchiving notes:", error);
            set({ error: "Error unarchiving notes", isLoading: false });
        }
    },
}));
