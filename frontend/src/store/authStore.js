import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isCheckingAuth: true,


    signup: async (email, userName, password) => {
        set({ isLoading: true });
        try {
            const res = await axios.post(`${API_URL}/signup`, { email, userName, password });
            set({ user: res.data.user, isAuthenticated: true, isLoading: false });
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

    forgotPassword: async (email) => {
        set({ error: null, isLoading: true });
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response.data.message || "Error sending reset password email",
            });
            throw error;
        }
    },
    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response.data.message || "Error resetting password",
            });
            throw error;
        }
    },
    resendVerificationCode: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/resend-verification`, { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response.data.message || "Error resending verification code",
            });
            throw error;
        }
    },
    // Resend password reset link
    resendPasswordReset: async (email) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(`${API_URL}/resend-password-reset`, { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));
