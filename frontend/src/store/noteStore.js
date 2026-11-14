import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore.js";
import { useArchieveStore } from "./archieveStore.js";

const API_URL = "/api/notes";
axios.defaults.withCredentials = true;
let accountVersion = 0;
let latestNotesRequest = 0;

export const useNoteStore = create((set, get) => ({
    notes: [],
    isLoading: false,
    error: null,
    isCreatingNote: false,
    isUpdatingNote: false,
    isDeletingNote: false,

    getNotes: async () => {
        const request = ++latestNotesRequest;
        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/get-notes`);
            if (request !== latestNotesRequest) return;
            set({ notes: res.data.notes, isLoading: false });
        } catch (err) {
            if (request !== latestNotesRequest) return;
            set({ error: err.response?.data?.message || "Error fetching notes", isLoading: false });
        }
    },
    createNote: async (note) => {
        const version = accountVersion;
        set({ isCreatingNote: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/create-note`, note);
            if (version !== accountVersion) return;
            await get().getNotes();
            if (version !== accountVersion) return;
            set({ isCreatingNote: false });
            return res.data.note;
        } catch (err) {
            if (version !== accountVersion) return;
            set({ error: err.response?.data?.message || "Error creating note", isCreatingNote: false });
        }
    },
    updateNote: async (noteId, note) => {
        const version = accountVersion;
        set({ isUpdatingNote: true, error: null });
        try {
            const res = await axios.put(`${API_URL}/update-note/${noteId}`, note);
            if (version !== accountVersion) return;
            set({ notes: get().notes.map(n => (n._id === noteId ? res.data.note : n)), isUpdatingNote: false });
            return res.data.note;
        } catch (err) {
            if (version !== accountVersion) return;
            set({ error: err.response?.data?.message || "Error updating note", isUpdatingNote: false });
        }
    },
    deleteNote: async (noteId) => {
        const version = accountVersion;
        set({ isDeletingNote: true, error: null });
        try {
            await axios.delete(`${API_URL}/delete-note/${noteId}`);
            if (version !== accountVersion) return;
            set({ notes: get().notes.filter(n => n._id !== noteId), isDeletingNote: false });
            return true;
        } catch (err) {
            if (version !== accountVersion) return;
            set({ error: err.response?.data?.message || "Error deleting note", isDeletingNote: false });
        }
    },
    archiveNote: async (noteId) => {
        const version = accountVersion;
        const note = await useArchieveStore.getState().archieveNote(noteId);
        if (version !== accountVersion) return;
        latestNotesRequest++;
        set((state) => ({
            notes: state.notes.filter((item) => item._id !== noteId),
            isLoading: false,
            error: null,
        }));
        return note;
    },
    saveFlashcard: async (noteId, { action, cardId, ...fields }) => {
        const version = accountVersion;
        const base = `${API_URL}/${encodeURIComponent(noteId)}/flashcards`;
        const url = cardId ? `${base}/${cardId}` : base;
        const { data } = await axios({ method: action, url, data: fields });
        if (version !== accountVersion) return;
        latestNotesRequest++;
        set((state) => ({
            notes: state.notes.map((note) => note._id === noteId ? data.note : note),
            isLoading: false,
        }));
        return data.note;
    },
    pinNote: async (noteId) => {
        const version = accountVersion;
        set({ isUpdatingNote: true, error: null });
        try {
            const res = await axios.put(`${API_URL}/pin-note/${noteId}`);
            if (version !== accountVersion) return;
            set({ notes: get().notes.map(n => (n._id === noteId ? res.data.note : n)), isUpdatingNote: false });
            return res.data.note;
        } catch (err) {
            if (version !== accountVersion) return;
            set({ error: err.response?.data?.message || "Error pinning note", isUpdatingNote: false });
        }
    },
    unpinNote: async (noteId) => {
        const version = accountVersion;
        set({ isUpdatingNote: true, error: null });
        try {
            const res = await axios.put(`${API_URL}/unpin-note/${noteId}`);
            if (version !== accountVersion) return;
            set({ notes: get().notes.map(n => (n._id === noteId ? res.data.note : n)), isUpdatingNote: false });
            return res.data.note;
        } catch (err) {
            if (version !== accountVersion) return;
            set({ error: err.response?.data?.message || "Error unpinning note", isUpdatingNote: false });
        }
    },


}));

useAuthStore.subscribe((state, previous) => {
    if (state.user?._id === previous.user?._id) return;
    accountVersion++;
    latestNotesRequest++;
    useNoteStore.setState({
        notes: [],
        error: null,
        isLoading: false,
        isCreatingNote: false,
        isUpdatingNote: false,
        isDeletingNote: false,
    });
});
