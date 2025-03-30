import axios from "axios";
import { create } from "zustand";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/schedule" : "/api/schedule";


axios.defaults.withCredentials = true;
export const useTaskStore = create((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,
    isCreatingTask: false,
    isUpdatingTask: false,
    isDeletingTask: false,

    getTasks: async () => {
        set({ isLoading: true });
        try {
            const res = await axios.get(`${API_URL}/get-tasks`);
            set({ tasks: res.data.tasks, isLoading: false });
        } catch (err) {
            //console.error("Fetch Tasks Error:", err.response?.data || err.message);
            set({ error: err.response?.data?.message || "Error fetching tasks", isLoading: false });
        }
    },

    createTask: async (task) => {
        set({ isCreatingTask: true });
        try {
            const res = await axios.post(`${API_URL}/create-task`, task);
            await get().getTasks(); // this is use for update the task list after creating a new task
            set({ isCreatingTask: false });
        } catch (err) {
            //console.error("Create Task Error:", err.response?.data || err.message);
            set({ error: err.response?.data?.message || "Error creating task", isCreatingTask: false });
        }
    },

    updateTask: async (taskId, task) => {
        set({ isUpdatingTask: true });
        try {
            const res = await axios.put(`${API_URL}/update-task/${taskId}`, task);
            set({ tasks: get().tasks.map(t => (t._id === taskId ? res.data.task : t)), isUpdatingTask: false });
        } catch (err) {
            //console.error("Update Task Error:", err.response?.data || err.message);
            set({ error: err.response?.data?.message || "Error updating task", isUpdatingTask: false });
        }
    },

    deleteTask: async (taskId) => {
        set({ isDeletingTask: true });
        try {
            await axios.delete(`${API_URL}/delete-task/${taskId}`);
            set({ tasks: get().tasks.filter(t => t._id !== taskId), isDeletingTask: false });
        } catch (err) {
            //console.error("Delete Task Error:", err.response?.data || err.message);
            set({ error: err.response?.data?.message || "Error deleting task", isDeletingTask: false });
        }
    },
}));
