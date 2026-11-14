import axios from "axios";
import { create } from "zustand";
import { useAuthStore } from "./authStore.js";

const API_URL = "/api/schedule";

axios.defaults.withCredentials = true;
let latestTasksRequest = 0;

export const useTaskStore = create((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,
    isCreatingTask: false,
    isUpdatingTask: false,
    isDeletingTask: false,

    getTasks: async () => {
        const request = ++latestTasksRequest;
        const tasksAtRequest = get().tasks;
        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/get-tasks`);
            if (request !== latestTasksRequest) return;
            // An edit may have already refreshed the store while this request was in flight.
            set((state) => ({
                tasks: state.tasks === tasksAtRequest ? res.data.tasks : state.tasks,
                isLoading: false,
            }));
        } catch (err) {
            if (request !== latestTasksRequest) return;
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
            return res.data.task;
        } catch (err) {
            //console.error("Create Task Error:", err.response?.data || err.message);
            set({ error: err.response?.data?.message || "Error creating task", isCreatingTask: false });
        }
    },

    updateTask: async (taskId, task) => {
        const ownerId = useAuthStore.getState().user?._id;
        set({ isUpdatingTask: true, error: null });
        try {
            const res = await axios.put(`${API_URL}/update-task/${taskId}`, task);
            if (useAuthStore.getState().user?._id !== ownerId) return null;
            set({ tasks: get().tasks.map(t => (t._id === taskId ? res.data.task : t)), isUpdatingTask: false });
            return res.data.task;
        } catch (err) {
            if (useAuthStore.getState().user?._id !== ownerId) return null;
            //console.error("Update Task Error:", err.response?.data || err.message);
            set({ error: err.response?.data?.message || "Error updating task", isUpdatingTask: false });
            return null;
        }
    },

    deleteTask: async (taskId) => {
        set({ isDeletingTask: true });
        try {
            await axios.delete(`${API_URL}/delete-task/${taskId}`);
            set({ tasks: get().tasks.filter(t => t._id !== taskId), isDeletingTask: false });
            return true;
        } catch (err) {
            //console.error("Delete Task Error:", err.response?.data || err.message);
            set({ error: err.response?.data?.message || "Error deleting task", isDeletingTask: false });
        }
    },
    updateTopic: async (taskId, topicId, done) => {
        const ownerId = useAuthStore.getState().user?._id;
        const { data } = await axios.patch(`${API_URL}/${encodeURIComponent(taskId)}/topics/${topicId}`, { done });
        if (useAuthStore.getState().user?._id !== ownerId) return;
        set((state) => ({
            tasks: state.tasks.map((task) => task._id === taskId ? data.task : task),
        }));
    },
}));

useAuthStore.subscribe((state, previousState) => {
    if (state.user?._id === previousState.user?._id) return;
    latestTasksRequest++;
    useTaskStore.setState({
        tasks: [],
        error: null,
        isLoading: false,
        isUpdatingTask: false,
    });
});
