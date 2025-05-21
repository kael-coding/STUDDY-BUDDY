import { useState, useEffect } from 'react';
import { useArchieveStore } from "../../store/archieveStore.js";
import { useNoteStore } from "../../store/noteStore.js";
import { useTaskStore } from "../../store/taskStore";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast"

const ArchiveMainContent = () => {
    const { getArchiveTask, archieve } = useArchieveStore();
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [isNoteModalOpen, setNoteModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editingNote, setEditingNote] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('all');
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { deleteTask } = useTaskStore();
    const { deleteNote } = useNoteStore();
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [noteToDelete, setNoteToDelete] = useState(null);

    const [currentTask, setCurrentTask] = useState({
        title: '',
        description: '',
        priority: '',
        dueDate: '',
        status: '',
        startDate: '',
        timeDue: '',
    });

    const [currentNote, setCurrentNote] = useState({ title: '', description: '' });

    useEffect(() => {
        getArchiveTask();
    }, [getArchiveTask]);

    const filteredTasks = (archieve?.tasks || []).filter((task) => {
        const today = new Date();
        const dueDate = new Date(task.dueDate);

        if (filter === 'all' || filter === 'tasks') {
            if (sortBy === 'all' || filter === 'all') return true;
            if (sortBy === 'complete') return task.status === 'completed';
            if (sortBy === 'overdue') return task.status === 'overdue' || (dueDate < today && task.status !== 'completed');
        }

        return false;
    });

    const filteredNotes = (archieve?.notes || []).filter(() => filter === 'all' || filter === 'notes');

    const openTaskModal = (task) => {
        setEditingTask(task);
        setCurrentTask(task);
        setTaskModalOpen(true);
    };

    const openNoteModal = (note) => {
        setEditingNote(note);
        setCurrentNote(note);
        setNoteModalOpen(true);
    };

    const closeTaskModal = () => setTaskModalOpen(false);
    const closeNoteModal = () => setNoteModalOpen(false);

    const confirmDelete = (type, item) => {
        if (type === 'task') {
            setTaskToDelete(item);
        } else if (type === 'note') {
            setNoteToDelete(item);
        }
        setDeleteModalOpen(true);
    };

    const closeDeleteConfirm = () => {
        setTaskToDelete(null);
        setNoteToDelete(null);
        setDeleteModalOpen(false);
    };

    const handleDeleteTask = async () => {
        if (!taskToDelete) return;
        setIsLoading(true);
        try {
            await deleteTask(taskToDelete._id);
            toast.success("Task deleted successfully!");
            setTaskModalOpen(false);
            setTaskToDelete(null);
            getArchiveTask();
        } catch (error) {
            toast.error("Error deleting task!");
        } finally {
            setIsLoading(false);
            setDeleteModalOpen(false);
        }
    };

    const handleDeleteNotes = async () => {
        if (!noteToDelete) return;
        setIsLoading(true);
        try {
            await deleteNote(noteToDelete._id);
            toast.success("Note deleted successfully!");
            setNoteModalOpen(false);
            setNoteToDelete(null);
            getArchiveTask();
        } catch (error) {
            toast.error("Failed to delete note.");
        } finally {
            setIsLoading(false);
            setDeleteModalOpen(false);
        }
    };

    const getPriorityStyles = (priority) => {
        const lower = priority?.toLowerCase();
        return lower === "low"
            ? "bg-green-100 text-green-700"
            : lower === "medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700";
    };

    const nothingFound =
        (filter === 'all' && filteredTasks.length === 0 && filteredNotes.length === 0) ||
        (filter === 'tasks' && filteredTasks.length === 0) ||
        (filter === 'notes' && filteredNotes.length === 0);

    return (
        <div className="mt-1">
            <section className="mb-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Archive</h2>
                <div className="flex justify-between items-center flex-wrap">
                    <div className="flex space-x-2">
                        {['all', 'tasks', 'notes'].map((f, index) => (
                            <button
                                key={index}
                                className={`px-4 py-2 rounded ${filter === f ? 'bg-[#6e8378] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    {filter === 'tasks' && (
                        <div className="flex space-x-4 ml-auto mt-6 md:mt-0">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-white-300"
                            >
                                <option value="all">Sort By</option>
                                <option value="complete">Complete</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                    )}
                </div>
            </section>

            {nothingFound ? (
                <div className="text-gray-500 text-center mt-10">
                    {filter === 'all' ? "No tasks or notes found." : filter === 'tasks' ? "No tasks found." : "No notes found."}
                </div>
            ) : (
                <>
                    {(filter === 'all' || filter === 'tasks') && filteredTasks.length > 0 && (
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {filteredTasks.map((task) => (
                                <div
                                    key={task._id}
                                    className="bg-white p-4 rounded shadow hover:shadow-lg hover:scale-105 transition-all duration-300"
                                    onClick={() => openTaskModal(task)}
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-800">{task.title}</h3>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityStyles(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-800">📅 {task.dueDate?.slice(0, 10)}</h3>
                                    <p className="font-bold text-gray-500">{task.timeDue}</p>
                                    <p className="text-sm text-gray-500">{task.description}</p>
                                    <p className="text-sm text-gray-500"><span>Status: </span>{task.status}</p>
                                </div>
                            ))}
                        </section>
                    )}

                    {(filter === 'all' || filter === 'notes') && filteredNotes.length > 0 && (
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredNotes.map((note) => (
                                <div
                                    key={note._id}
                                    className="bg-white p-4 rounded shadow hover:shadow-lg hover:scale-105 transition-all duration-300"
                                    onClick={() => openNoteModal(note)}
                                >
                                    <h3 className="font-bold text-gray-800">{note.title}</h3>
                                    <p className="text-sm text-gray-500">{note.description}</p>
                                </div>
                            ))}
                        </section>
                    )}
                </>
            )}

            {/* Task Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md bg-black/30 transition-all duration-300 z-60">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold">Task Details</h2>
                        <label className="block text-sm font-medium text-gray-700 mt-2">Task Title</label>
                        <input type="text" className="w-full p-2 border rounded mt-1" value={currentTask.title} disabled />
                        <label className="block text-sm font-medium text-gray-700 mt-2">Start Date</label>
                        <input type="date" className="w-full p-2 border rounded mt-1" value={currentTask.startDate} disabled />
                        <label className="block text-sm font-medium text-gray-700 mt-2">Due Date</label>
                        <input type="date" className="w-full p-2 border rounded mt-1" value={currentTask.dueDate} disabled />
                        <label className="block text-sm font-medium text-gray-700 mt-2">Due Time</label>
                        <input type="time" className="w-full p-2 border rounded mt-1" value={currentTask.timeDue} disabled />
                        <label className="block text-sm font-medium text-gray-700 mt-2">Task Details</label>
                        <textarea className="w-full p-2 border rounded mt-1" value={currentTask.description} disabled />
                        <label className="block text-sm font-medium text-gray-700 mt-2">Priority</label>
                        <select className="w-full p-2 border rounded mt-1" value={currentTask.priority} disabled>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>

                        <div className="flex justify-between mt-4">
                            <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={closeTaskModal}>
                                Cancel
                            </button>
                            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => confirmDelete('task', currentTask)}>
                                🗑 Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Note Modal */}
            {isNoteModalOpen && (
                <div className="fixed inset-0 backdrop-blur-md bg-black/30 bg-opacity-50 flex justify-center items-center z-60">
                    <div className="bg-white p-5 rounded-lg shadow-lg w-80">
                        <h2 className="text-lg font-semibold">Note</h2>
                        <input type="text" value={currentNote.title} disabled className="w-full p-3 mt-2 border rounded-md border-gray-300" />
                        <textarea value={currentNote.description} disabled className="w-full p-3 mt-2 border rounded-md border-gray-300" />
                        <div className="mt-4 flex justify-end space-x-2">
                            <button onClick={closeNoteModal} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                            <button onClick={() => confirmDelete('note', currentNote)} className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-30 z-60">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold text-center">Confirm Deletion</h2>
                        <p className="text-center">Are you sure you want to delete this {taskToDelete ? "task" : "note"}?</p>
                        <div className="flex justify-between mt-5">
                            <button onClick={closeDeleteConfirm} className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">Cancel</button>
                            <button
                                onClick={taskToDelete ? handleDeleteTask : handleDeleteNotes}
                                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchiveMainContent;
