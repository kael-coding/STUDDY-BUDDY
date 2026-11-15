// store/chatStore.js
import { create } from 'zustand';
import toast from 'react-hot-toast';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from './authStore';

const mergeMessages = (history, live) => Array.from(
    new Map([...history, ...live].map((message) => [message._id, message])).values(),
).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
let conversationVersion = 0;
let contactsRequest = 0;
let messagesRequest = 0;
let messageChangeVersion = 0;

const withPreview = (users, contact, message) => {
    const existing = users.find(({ _id }) => _id === contact._id);
    if (existing?.lastMessage && Date.parse(existing.lastMessage.createdAt) > Date.parse(message.createdAt)) return users;
    return [{ ...(existing || contact), lastMessage: message }, ...users.filter(({ _id }) => _id !== contact._id)];
};

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    usersError: null,
    isMessagesLoading: false,
    messagesError: null,

    getUsers: async () => {
        const request = ++contactsRequest;
        const before = new Map(get().users.map(({ _id, lastMessage }) => [_id, lastMessage]));
        set({ isUsersLoading: true, usersError: null });
        try {
            const res = await axiosInstance.get('/chat/messages/users');
            if (request === contactsRequest) {
                const current = get().users;
                const inbox = new Map(res.data.map((contact) => [contact._id, contact]));
                for (const contact of current) {
                    if (before.get(contact._id) === contact.lastMessage) continue;
                    const server = inbox.get(contact._id);
                    if (!server || Date.parse(contact.lastMessage?.createdAt) > Date.parse(server.lastMessage?.createdAt)) {
                        inbox.set(contact._id, contact);
                    }
                }
                set({ users: [...inbox.values()] });
            }
        } catch {
            if (request === contactsRequest) set({ usersError: "Could not load conversations." });
        } finally {
            if (request === contactsRequest) set({ isUsersLoading: false });
        }
    },

    sendMessage: async (data) => {
        const { selectedUser } = get();
        if (!selectedUser) return false;
        const version = conversationVersion;
        const changeVersion = messageChangeVersion;
        try {
            const res = await axiosInstance.post(`/chat/send/${encodeURIComponent(selectedUser._id)}`, data);
            if (useAuthStore.getState().user?._id === res.data.senderId && changeVersion === messageChangeVersion) {
                set((state) => ({
                    users: withPreview(state.users, selectedUser, res.data),
                    ...(version === conversationVersion && { messages: mergeMessages(state.messages, [res.data]) }),
                }));
            } else {
                await get().refreshConversation(res.data);
            }
            return true;
        } catch {
            toast.error("Failed to send message");
            return false;
        }
    },

    getMessages: async (userId) => {
        if (get().selectedUser?._id !== userId) return;
        const version = conversationVersion;
        const request = ++messagesRequest;
        const before = new Set(get().messages.map(({ _id }) => _id));
        const isCurrent = () => version === conversationVersion && request === messagesRequest;
        set({ isMessagesLoading: true, messagesError: null });
        try {
            const res = await axiosInstance.get(`/chat/messages/${encodeURIComponent(userId)}`);
            if (isCurrent()) {
                set((state) => ({ messages: mergeMessages(state.messages.filter(({ _id }) => !before.has(_id)), res.data) }));
            }
        } catch {
            if (isCurrent()) set({ messagesError: "Could not load this conversation." });
        } finally {
            if (isCurrent()) set({ isMessagesLoading: false });
        }
    },

    refreshConversation: async ({ senderId, receiverId }) => {
        const accountId = useAuthStore.getState().user?._id;
        if (accountId !== senderId && accountId !== receiverId) return;
        messageChangeVersion++;
        const contactId = accountId === senderId ? receiverId : senderId;
        const { selectedUser, getMessages, getUsers } = get();
        await Promise.all([getUsers(), selectedUser?._id === contactId ? getMessages(contactId) : undefined]);
    },

    editMessage: async (message, text) => {
        const { data } = await axiosInstance.patch(`/chat/messages/${encodeURIComponent(message._id)}`, { text });
        await get().refreshConversation(data);
    },

    deleteMessage: async (message) => {
        await axiosInstance.delete(`/chat/messages/${encodeURIComponent(message._id)}`);
        await get().refreshConversation(message);
    },

    receiveMessage: (message) => {
        if (message.receiverId !== useAuthStore.getState().user?._id) return;
        const { selectedUser, users, getUsers } = get();
        const active = message.senderId === selectedUser?._id;
        const contact = active ? selectedUser : users.find(({ _id }) => _id === message.senderId);
        if (!contact) {
            getUsers();
            return;
        }
        set((state) => ({
            users: withPreview(state.users, contact, message),
            ...(active && { messages: mergeMessages(state.messages, [message]) }),
        }));
    },

    setSelectedUser: (user) => {
        if (get().selectedUser?._id === user?._id) return;
        conversationVersion++;
        set({ selectedUser: user, messages: [], messagesError: null, isMessagesLoading: Boolean(user) });
    },
}));

useAuthStore.subscribe((state, previous) => {
    if (state.user?._id !== previous.user?._id) {
        contactsRequest++;
        useChatStore.getState().setSelectedUser(null);
        useChatStore.setState({ users: [], usersError: null, isUsersLoading: false });
    }
});
