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

    // Fetch user details with proper error handling
    fetchUserDetails: async () => {
        set({ isLoading: true, error: null, isCheckingAuth: true });
        try {
            const res = await axios.get(`${API_URL}/details`);
            set({
                user: res.data.user,
                isAuthenticated: true,
                isLoading: false,
                isCheckingAuth: false,
            });
            return {
                success: true,
                user: res.data.user
            };
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch user details",
                isLoading: false,
                isAuthenticated: false,
                isCheckingAuth: false,
            });
            return {
                success: false,
                error: error.response?.data?.message || "Failed to fetch user details"
            };
        }
    },

    // Update profile picture with immediate state update
    updateProfilePicture: async (profilePicture) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.put(`${API_URL}/update-profile-picture`, { profilePicture });
            set((state) => ({
                user: { ...state.user, profilePicture: res.data.user.profilePicture },
                isLoading: false,
            }));
            return { success: true, user: res.data.user };
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to update profile picture",
                isLoading: false,
            });
            return { success: false, error: error.response?.data?.message || "Failed to update profile picture" };
        }
    },

    // Update password (no user data changes needed)
    updatePassword: async (currentPassword, newPassword, confirmPassword) => {
        set({ isLoading: true, error: null });
        try {
            await axios.put(`${API_URL}/update-password`, {
                currentPassword,
                newPassword,
                confirmPassword
            });
            set({ isLoading: false });
            return { success: true };
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to update password",
                isLoading: false,
            });
            return { success: false, error: error.response?.data?.message || "Failed to update password" };
        }
    },

    // Update profile with immediate state update
    updateProfile: async (userName, course, school) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.put(`${API_URL}/update-profile`, {
                userName,
                course,
                school
            });
            set((state) => ({
                user: {
                    ...state.user,
                    userName: res.data.updatedProfile.userName,
                    course: res.data.updatedProfile.course,
                    school: res.data.updatedProfile.school
                },
                isLoading: false,
            }));
            return { success: true, user: res.data.updatedProfile };
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to update profile",
                isLoading: false,
            });
            return { success: false, error: error.response?.data?.message || "Failed to update profile" };
        }
    },
}));