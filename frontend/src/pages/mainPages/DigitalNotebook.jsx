import { useState, useEffect } from "react";
import { useNoteStore } from "../../store/noteStore.js";
import { useArchieveStore } from "../../store/archieveStore.js";
import { FaEdit, FaTrash, FaThumbtack, FaArchive } from "react-icons/fa";
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

    const {
        archieveNote,
        unarchiveNote,
    } = useArchieveStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState({ title: "", description: "" });
    const [editingId, setEditingId] = useState(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

    useEffect(() => {
        getNotes(); // Initial call to load the notes
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
            getNotes();  // Refresh the notes list after saving
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

    const toggleArchive = async (note) => {
        try {
            if (note.isArchived) {
                await unarchiveNote(note._id);
                toast.success("Note unarchived successfully!");
            } else {
                await archieveNote(note._id);
                toast.success("Note archived successfully!");
            }
            getNotes();  // Refresh notes after archiving/unarchiving
        } catch (error) {
            toast.error("Failed to update archive status.");
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
            getNotes();  // Refresh notes list after deletion
        } catch (error) {
            toast.error("Failed to delete note.");
        }
        closeDeleteConfirm();
    };

    return (
        <main className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading ? (
                <p className="text-gray-500 mb-4">Loading notes...</p>
            ) : (
                <>
                    {notes.map((note) => (
                        !note.isArchived && ( // Don't display archived notes
                            <div
                                key={note._id}
                                className={`p-5 bg-white rounded-lg shadow relative border ${note.isPinned ? "border-yellow-500" : "border-gray-300"}`}
                            >
                                <h2 className="font-semibold">{note.title}</h2>
                                <p className="text-gray-500 text-sm">March 25, 2025</p>
                                <p className="text-gray-600 text-sm mt-2">{note.description}</p>
                                <div className="absolute top-2 right-2 flex space-x-2">
                                    <button
                                        onClick={() => openEditModal(note)}
                                        className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 text-lg"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => openDeleteConfirm(note)}
                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 text-lg"
                                    >
                                        <FaTrash />
                                    </button>
                                    <button
                                        onClick={() => togglePin(note)}
                                        className={`transition-all duration-200 text-yellow-500 ${note.isPinned ? "opacity-100 scale-110" : "opacity-50"} hover:scale-110 text-lg`}
                                    >
                                        <FaThumbtack />
                                    </button>
                                    <button
                                        onClick={() => toggleArchive(note)}
                                        className="transition-all duration-200 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 text-lg"
                                    >
                                        <FaArchive />
                                    </button>
                                </div>
                            </div>
                        )
                    ))}

                    {/* Add Note Card */}
                    <div
                        onClick={openCreateModal}
                        className="p-5 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow flex items-center justify-center cursor-pointer hover:bg-gray-100"
                    >
                        <span className="text-3xl text-blue-500">➕</span>
                    </div>

                    {/* Modal for creating/editing notes */}
                    {isModalOpen && (
                        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-5 rounded-lg shadow-lg w-80">
                                <h2 className="text-lg font-semibold">{editingId ? "Edit Note" : "Create Note"}</h2>
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={currentNote.title}
                                    onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={currentNote.description}
                                    onChange={(e) => setCurrentNote({ ...currentNote, description: e.target.value })}
                                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                                />
                                <div className="mt-4 flex justify-end space-x-2">
                                    <button
                                        onClick={saveNote}
                                        className="bg-blue-500 text-white px-4 py-2 rounded"
                                    >
                                        {editingId ? "Save" : "Create"}
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        className="bg-gray-500 text-white px-4 py-2 rounded"
                                    >
                                        Cancel
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
                                <p className="text-center">Are you sure you want to delete this Notes?</p>
                                <div className="flex justify-between mt-5">
                                    <button onClick={closeDeleteConfirm} className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                                        Cancel
                                    </button>
                                    <button onClick={confirmDelete} className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </main>
    );
};

export default DigitalNotebook;
