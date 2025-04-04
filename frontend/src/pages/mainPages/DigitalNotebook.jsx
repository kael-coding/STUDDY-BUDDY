import { useState, useEffect } from "react";
import { useNoteStore } from "../../store/noteStore.js";
import { FaEdit, FaTrash, FaThumbtack } from "react-icons/fa";
import { toast } from "react-hot-toast";

const DigitalNotebook = () => {
    const {
        notes,
        isLoading,
        getNotes,
        createNote,
        updateNote,
        deleteNote,
        pinNote,
        unpinNote,
    } = useNoteStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState({ title: "", description: "" });
    const [editingId, setEditingId] = useState(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

    useEffect(() => {
        getNotes();
    }, []);

    const openCreateModal = () => {
        setCurrentNote({ title: "", description: "" });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (note) => {
        setCurrentNote({ title: note.title, description: note.description });
        setEditingId(note._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentNote({ title: "", description: "" });
        setEditingId(null);
    };

    const saveNote = async () => {
        if (!currentNote.title || !currentNote.description) {
            toast.error("Please fill in all fields.");
            return;
        }
        try {
            if (editingId) {
                await updateNote(editingId, currentNote);
                toast.success("Note updated successfully!");
            } else {
                await createNote(currentNote);
                toast.success("Note created successfully!");
            }
            closeModal();
        } catch (error) {
            toast.error("Failed to save note.");
        }
    };

    const togglePin = async (note) => {
        try {
            note.isPinned ? await unpinNote(note._id) : await pinNote(note._id);
            toast.success(`Note ${note.isPinned ? "unpinned" : "pinned"} successfully!`);
            getNotes();
        } catch (error) {
            toast.error("Failed to update pin status.");
        }
    };

    const openDeleteConfirm = (note) => {
        setNoteToDelete(note);
        setIsDeleteConfirmOpen(true);
    };

    const closeDeleteConfirm = () => {
        setIsDeleteConfirmOpen(false);
        setNoteToDelete(null);
    };

    const confirmDelete = async () => {
        try {
            await deleteNote(noteToDelete._id);
            toast.success("Note deleted successfully!");
            getNotes();
        } catch (error) {
            toast.error("Failed to delete note.");
        }
        closeDeleteConfirm();
    };

    return (
        <div className="p-5 max-w-4xl mx-auto bg-white min-h-screen">
            <h1 className="text-3xl font-semibold mb-4 text-center text-gray-800">Digital Notebook</h1>

            {isLoading ? (
                <p className="text-center text-gray-500">Loading notes...</p>
            ) : (
                <>
                    {notes.length === 0 && (
                        <p className="text-center text-gray-400 mb-4">No notes available. Create one!</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {notes.map((note) => (
                            <div
                                key={note._id}
                                className={`p-6 bg-white rounded-lg shadow-md border ${note.isPinned ? "border-yellow-500" : "border-gray-300"} relative transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                            >
                                <h2 className="text-xl font-semibold text-gray-800">{note.title}</h2>
                                <p className="text-gray-500 text-sm">{note.date}</p>
                                <p className="text-gray-600 text-sm mt-2">{note.description}</p>
                                <div className="absolute top-2 right-2 flex space-x-2">
                                    <button
                                        onClick={() => openEditModal(note)}
                                        className="text-blue-500 hover:text-blue-700 transition-all duration-200"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => openDeleteConfirm(note)}
                                        className="text-red-500 hover:text-red-700 transition-all duration-200"
                                    >
                                        <FaTrash />
                                    </button>
                                    <button
                                        onClick={() => togglePin(note)}
                                        className={`transition-all duration-200 text-yellow-500 ${note.isPinned ? "opacity-100 scale-110" : "opacity-50"} hover:scale-110`}
                                    >
                                        <FaThumbtack />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* "Add Note" button - Always visible */}
                        <div
                            onClick={openCreateModal}
                            className="p-5 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            <span className="text-4xl text-blue-500">➕</span>
                        </div>
                    </div>
                </>
            )}

            {/* Create or Edit Note Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-30">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold text-center">{editingId ? "Edit Note" : "Create Note"}</h2>
                        <input
                            type="text"
                            placeholder="Note Title"
                            value={currentNote.title}
                            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                            className="w-full p-3 border rounded mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                            placeholder="Note Description"
                            value={currentNote.description}
                            onChange={(e) => setCurrentNote({ ...currentNote, description: e.target.value })}
                            className="w-full p-3 border rounded mt-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                        <div className="flex justify-between mt-5">
                            <button onClick={closeModal} className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-all duration-300">
                                Cancel
                            </button>
                            <button onClick={saveNote} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-300">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-30">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold text-center">Confirm Deletion</h2>
                        <p className="text-center">Are you sure you want to delete this note?</p>
                        <div className="flex justify-between mt-5">
                            <button onClick={closeDeleteConfirm} className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-all duration-300">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-300">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitalNotebook;
