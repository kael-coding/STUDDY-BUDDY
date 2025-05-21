import { create } from "zustand";
import { toast } from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";
const BASE_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "studdy-buddy-production.up.railway.app"
axios.defaults.withCredentials = true;

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isCheckingAuth: true,
    isUpdated: false,
    message: null,
    onlineUsers: [],
    socket: null,

    signup: async (email, userName, password) => {
        set({ isLoading: true });
        try {
            const res = await axios.post(`${API_URL}/signup`, { email, userName, password });
            set({ user: res.data.user, isAuthenticated: true, isLoading: false });
            get().connectSocket();
        } catch (err) {
            set({ error: err.response.data.message || "Error signing up", isLoading: false });
            throw err;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            set({
                isAuthenticated: true,
                user: response.data.user,
                error: null,
                isLoading: false,
            });
            get().connectSocket();
            return response.data.user;
        } catch (error) {
            set({ error: error.response.data.message || "Error logging in", isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`${API_URL}/logout`);
            set({ user: null, isAuthenticated: false, error: null, isLoading: false });
            get().disconnectSocket();
        } catch (error) {
            set({ error: "Error logging out", isLoading: false });
            throw error;
        }
    },

    verifyEmail: async (verificationCode) => {
        set({ isLoading: true });
        try {
            const res = await axios.post(`${API_URL}/verify-email`, { code: verificationCode });
            set({ user: res.data.user, isAuthenticated: false, isLoading: false });
        } catch (err) {
            set({ error: err.response.data.message || "Error verifying email", isLoading: false });
            throw err;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/check-auth`);
            set({
                user: res.data.user,
                isAuthenticated: true,
                isCheckingAuth: false,
            });
            get().connectSocket();
        } catch (error) {
            set({
                isAuthenticated: false,
                user: null,
                isCheckingAuth: false,
                error: null,
            });
        }
    },

    forgotPassword: async (email) => {
        set({ error: null, isLoading: true });
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: error.response.data.message || "Error sending reset password email" });
            throw error;
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: error.response.data.message || "Error resetting password" });
            throw error;
        }
    },

    updateProfile: async (data) => {
        set({ isUpdated: true, error: null, isLoading: true });
        try {
            const res = await axios.put(`${API_URL}/user/update-profile`, data);
            set({ user: res.data.user, isUpdated: true, error: null, isLoading: false });
            toast.success("Profile updated successfully");
            get().connectSocket();
        } catch (error) {
            set({ isUpdated: false, error: error.response.data.message || "Error updating profile", isLoading: false });
            throw error;
        }
    },

    connectSocket: () => {
        const { user } = get();
        if (!user) return;

        const socket = io(BASE_URL, {
            auth: {
                userId: user._id,
            },
            withCredentials: true,
        });

        socket.connect();
        set({ socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) socket.disconnect();
        set({ socket: null });
    },
}));
