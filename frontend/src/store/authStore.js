import { create } from "zustand";
import { toast } from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";
import { refreshSession, sessionChanged, withSessionCookies } from "../lib/sessionRefresh.js";

const API_URL = "/api/auth";
axios.defaults.withCredentials = true;
let authCheck;

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isCheckingAuth: true,
    authCheckError: null,
    isUpdated: false,
    message: null,
    onlineUsers: [],
    socket: null,

    signup: async (email, userName, password) => {
        set({ isLoading: true });
        try {
            const res = await withSessionCookies(() => axios.post(`${API_URL}/signup`, { email, userName, password }));
            sessionChanged();
            get().disconnectSocket();
            set({ user: res.data.user, isAuthenticated: true, isLoading: false });
            get().connectSocket();
        } catch (err) {
            set({ error: err.response?.data?.message || "Error signing up", isLoading: false });
            throw err;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await withSessionCookies(() => axios.post(`${API_URL}/login`, { email, password }));
            sessionChanged();
            get().disconnectSocket();
            set({
                isAuthenticated: true,
                user: response.data.user,
                error: null,
                isLoading: false,
            });
            get().connectSocket();
            return response.data.user;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await withSessionCookies(() => axios.post(`${API_URL}/logout`));
            get().clearSession();
        } catch (error) {
            set({ error: "Error logging out", isLoading: false });
            throw error;
        }
    },

    verifyEmail: async (verificationCode) => {
        set({ isLoading: true });
        try {
            const res = await axios.post(`${API_URL}/verify-email`, { code: verificationCode });
            sessionChanged();
            get().disconnectSocket();
            set({ user: res.data.user, isAuthenticated: false, isLoading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || "Error verifying email", isLoading: false });
            throw err;
        }
    },

    checkAuth: () => {
        if (authCheck) return authCheck;
        set({ isCheckingAuth: true, authCheckError: null });
        authCheck = axios.get(`${API_URL}/check-auth`)
            .then(({ data }) => {
                set({ user: data.user, isAuthenticated: true, isCheckingAuth: false });
                get().connectSocket();
            })
            .catch((error) => {
                // The HTTP interceptor clears the session only after a definitive 401.
                if (error.response?.status === 401 && !get().isCheckingAuth) return;
                set({
                    isCheckingAuth: false,
                    authCheckError: "Could not check your session. Try again.",
                });
            })
            .finally(() => { authCheck = undefined; });
        return authCheck;
    },

    forgotPassword: async (email) => {
        set({ error: null, isLoading: true });
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: error.response?.data?.message || "Could not send the reset email. Please try again." });
            throw error;
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: error.response?.data?.message || "Could not reset your password. Please try again." });
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

    resendVerificationCode: async (email) => {
        try {
            set({ isLoading: true, error: null });

            const response = await axios.post(`${API_URL}/resend-verification`, { email });

            if (response.data.success) {
                toast.success(response.data.message);
                return true;
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error resending verification code:', error);
            set({ error: error.response?.data?.message || error.message || 'Failed to resend verification code' });
            toast.error(error.response?.data?.message || error.message || 'Failed to resend verification code');
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    resendPasswordReset: async (email) => {
        try {
            set({ isLoading: true });

            const response = await axios.post(`${API_URL}/resend-password-reset`, { email });

            if (response.data.success) {
                toast.success(response.data.message);
                return true;
            }
            throw new Error(response.data.message || 'Failed to resend password reset link');
        } catch (error) {
            console.error('Resend password reset error:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to resend password reset link');
            return false;
        } finally {
            set({ isLoading: false });
        }
    },
    clearSession: () => {
        sessionChanged();
        get().disconnectSocket();
        set({ user: null, isAuthenticated: false, error: null, isLoading: false, isCheckingAuth: false, authCheckError: null });
    },

    connectSocket: () => {
        const { user, socket: existingSocket } = get();
        if (!user?.isVerified || existingSocket) return;

        const socket = io({ withCredentials: true, autoConnect: false });
        set({ socket });

        let renewing = false;
        let retriedHandshake = false;
        const renewSocket = async () => {
            if (renewing || get().socket !== socket) return;
            renewing = true;
            try {
                const refreshed = await refreshSession();
                if (get().socket !== socket) return;
                if (refreshed) socket.connect();
                else get().clearSession();
            } catch {
                // HTTP requests can retry when connectivity returns.
            } finally {
                renewing = false;
            }
        };
        let expired = false;
        socket.on("sessionExpired", () => { expired = true; });
        socket.on("disconnect", () => {
            set({ onlineUsers: [] });
            if (expired) {
                expired = false;
                void renewSocket();
            }
        });
        socket.on("connect_error", (error) => {
            if (error.message === "Unauthorized" && !renewing && !retriedHandshake) {
                retriedHandshake = true;
                void renewSocket();
            }
        });
        socket.on("connect", () => { retriedHandshake = false; });
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
        socket.connect();
    },

    disconnectSocket: () => {
        const socket = get().socket;
        socket?.disconnect();
        set({ socket: null, onlineUsers: [] });
    },
}));
