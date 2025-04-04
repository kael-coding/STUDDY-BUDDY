import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/notes" : "/api/notes";
axios.defaults.withCredentials = true;

export const useNoteStore = create((set, get) => ({
    notes: [],
    isLoading: false,
    error: null,
    isCreatingNote: false,
    isUpdatingNote: false,
    isDeletingNote: false,

    getNotes: async () => {
        set({ isLoading: true });
        try {
            const res = await axios.get(`${API_URL}/get-notes`);
            set({ notes: res.data.notes, isLoading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || "Error fetching notes", isLoading: false });
        }
    },
    createNote: async (note) => {
        set({ isCreatingNote: true });
        try {
            const res = await axios.post(`${API_URL}/create-note`, note);
            await get().getNotes(); // Update the notes list after creating a new note
            set({ isCreatingNote: false });
        } catch (err) {
            set({ error: err.response?.data?.message || "Error creating note", isCreatingNote: false });
        }
    },
    updateNote: async (noteId, note) => {
        set({ isUpdatingNote: true });
        try {
            const res = await axios.put(`${API_URL}/update-note/${noteId}`, note);
            set({ notes: get().notes.map(n => (n._id === noteId ? res.data.note : n)), isUpdatingNote: false });
        } catch (err) {
            set({ error: err.response?.data?.message || "Error updating note", isUpdatingNote: false });
        }
    },
    deleteNote: async (noteId) => {
        set({ isDeletingNote: true });
        try {
            await axios.delete(`${API_URL}/delete-note/${noteId}`);
            set({ notes: get().notes.filter(n => n._id !== noteId), isDeletingNote: false });
        } catch (err) {
            set({ error: err.response?.data?.message || "Error deleting note", isDeletingNote: false });
        }
    },
    pinNote: async (noteId) => {
        set({ isUpdatingNote: true });
        try {
            const res = await axios.put(`${API_URL}/pin-note/${noteId}`);
            set({ notes: get().notes.map(n => (n._id === noteId ? res.data.note : n)), isUpdatingNote: false });
        } catch (err) {
            set({ error: err.response?.data?.message || "Error pinning note", isUpdatingNote: false });
        }
    },
    unpinNote: async (noteId) => {
        set({ isUpdatingNote: true });
        try {
            const res = await axios.put(`${API_URL}/unpin-note/${noteId}`);
            set({ notes: get().notes.map(n => (n._id === noteId ? res.data.note : n)), isUpdatingNote: false });
        } catch (err) {
            set({ error: err.response?.data?.message || "Error unpinning note", isUpdatingNote: false });
        }
    },


}));