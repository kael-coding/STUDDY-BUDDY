import { create } from "zustand";
import axios from "axios";

const API_URL = "/api/archieve";

export const useArchieveStore = create((set) => ({
    archieve: { tasks: [], notes: [] },
    isLoading: false,
    error: null,

    getArchiveTask: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/all`);
            set({ archieve: res.data.archived, isLoading: false });
        } catch (error) {
            console.error("Error fetching archived tasks:", error);
            set({ error: "Error fetching archived tasks", isLoading: false });
        }
    },

    archieveNote: async (id) => {
        const { data } = await axios.put(`${API_URL}/note/archive/${encodeURIComponent(id)}`);
        return data.note;
    },

    unarchiveNote: async (id) => {
        const { data } = await axios.put(`${API_URL}/note/unarchive/${encodeURIComponent(id)}`);
        return data.note;
    },
    setTaskArchived: async (id, isArchived) => {
        const { data } = await axios.put(`${API_URL}/task/archive/${encodeURIComponent(id)}`, { isArchived });
        return data.task;
    },
}));
