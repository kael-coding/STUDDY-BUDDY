import { create } from 'zustand';
import toast from 'react-hot-toast';
import axiosInstance from '../lib/axiosInstance'; // make sure path is correct
import { useAuthStore } from "../store/authStore.js";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const response = await axiosInstance.get(`/chat/messages/users`);
            set({ users: response.data, isUsersLoading: false });
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/chat/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to send message";
            toast.error(errorMsg);
            console.log(error);
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const response = await axiosInstance.get(`/chat/messages/${userId}`);
            set({ messages: response.data });
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to fetch messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    subcriptionToMessage: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {

            if (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id) {
                set({
                    messages: [...get().messages, newMessage],
                });
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
