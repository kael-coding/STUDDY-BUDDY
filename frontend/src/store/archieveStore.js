import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/archieve"  // Corrected endpoint
    : "/api/archieve";

export const useArchieveStore = create((set) => ({
    archieve: { tasks: [], notes: [] }, // Initialize tasks and notes
    isLoading: false,
    error: null,

    getArchiveTask: async () => {
        set({ isLoading: true });
        try {
            const res = await axios.get(`${API_URL}/all`);
            set({ archieve: res.data.archived, isLoading: false });  // Corrected response handling
        } catch (error) {
            console.error("Error fetching archived tasks:", error);
            set({ error: "Error fetching archived tasks", isLoading: false });
        }
    }
}));
