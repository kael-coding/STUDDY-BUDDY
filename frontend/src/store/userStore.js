import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/user" : "/api/user";

axios.defaults.withCredentials = true;



export const useUserStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isCheckingAuth: true,


    checkAuth: async () => {
        set({ isCheckingAuth: false, error: null });

        try {
            const res = await axios.get(`${API_URL}/check-auth`);
            set({
                user: res.data.user,
                isAuthenticated: true,
                isCheckingAuth: false,
            });
        } catch (error) {
            set({
                isAuthenticated: false,
                user: null,
                isCheckingAuth: false,
                error: null,
            });
        }
    },

}));
