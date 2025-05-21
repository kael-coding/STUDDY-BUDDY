// store/chatStore.js
import { create } from 'zustand';
import toast from 'react-hot-toast';
import axiosInstance from '../lib/axiosInstance';
import { useAuthStore } from './authStore';

const saveMessagesToLocalStorage = (userId, messages) => {
    localStorage.setItem(`messages_${userId}`, JSON.stringify(messages));
};

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get('/chat/messages/users');
            set({ users: res.data });
        } catch (err) {
            toast.error("Failed to fetch users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    sendMessage: async (data) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/chat/send/${selectedUser._id}`, data);
            const updatedMessages = [...messages, res.data];

            set({ messages: updatedMessages });
            saveMessagesToLocalStorage(selectedUser._id, updatedMessages);
        } catch (err) {
            toast.error("Failed to send message");
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/chat/messages/${userId}`);
            set({ messages: res.data });
            saveMessagesToLocalStorage(userId, res.data);
        } catch (err) {
            toast.error("Failed to fetch messages");

            // fallback: load from localStorage if available
            const fallback = localStorage.getItem(`messages_${userId}`);
            if (fallback) {
                set({ messages: JSON.parse(fallback) });
            }
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    subcriptionToMessage: () => {
        const { selectedUser } = get();
        const socket = useAuthStore.getState().socket;
        if (!socket || !selectedUser) return;

        socket.on("newMessage", (newMessage) => {
            if (
                newMessage.senderId === selectedUser._id ||
                newMessage.receiverId === selectedUser._id
            ) {
                set({ messages: [...get().messages, newMessage] });
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) socket.off("newMessage");
    },

    setSelectedUser: (user) => set({ selectedUser: user }),
}));
