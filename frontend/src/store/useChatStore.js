// store/chatStore.js
import { create } from 'zustand';
import toast from 'react-hot-toast';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from './authStore';

const mergeMessages = (history, live) => Array.from(
    new Map([...history, ...live].map((message) => [message._id, message])).values(),
).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
let conversationVersion = 0;

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    messagesError: null,

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
        const { selectedUser } = get();
        if (!selectedUser) return false;
        const version = conversationVersion;
        try {
            const res = await axiosInstance.post(`/chat/send/${selectedUser._id}`, data);
            if (version === conversationVersion) {
                set((state) => ({ messages: mergeMessages(state.messages, [res.data]) }));
            }
            return true;
        } catch (err) {
            toast.error("Failed to send message");
            return false;
        }
    },

    getMessages: async (userId) => {
        const version = conversationVersion;
        set({ isMessagesLoading: true, messagesError: null });
        try {
            const res = await axiosInstance.get(`/chat/messages/${userId}`);
            if (version === conversationVersion) {
                set((state) => ({ messages: mergeMessages(res.data, state.messages) }));
            }
        } catch (err) {
            if (version === conversationVersion) set({ messagesError: "Could not load this conversation." });
        } finally {
            if (version === conversationVersion) set({ isMessagesLoading: false });
        }
    },

    subcriptionToMessage: () => {
        const { selectedUser } = get();
        const socket = useAuthStore.getState().socket;
        if (!socket || !selectedUser) return;
        const version = conversationVersion;

        socket.on("newMessage", (newMessage) => {
            if (version === conversationVersion && (
                newMessage.senderId === selectedUser._id ||
                newMessage.receiverId === selectedUser._id
            )) {
                set((state) => ({ messages: mergeMessages(state.messages, [newMessage]) }));
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) socket.off("newMessage");
    },

    setSelectedUser: (user) => {
        if (get().selectedUser?._id === user?._id) return;
        conversationVersion++;
        set({ selectedUser: user, messages: [], messagesError: null, isMessagesLoading: Boolean(user) });
    },
}));

useAuthStore.subscribe((state, previous) => {
    if (state.user?._id !== previous.user?._id) {
        useChatStore.getState().setSelectedUser(null);
        useChatStore.setState({ users: [] });
    }
});
