import { useState, useEffect } from 'react';
import { useArchieveStore } from "../../store/archieveStore.js";

// In ArchiveMainContent.js
const ArchiveMainContent = () => {
    const { getArchiveTask, archieve } = useArchieveStore();
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [isNoteModalOpen, setNoteModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editingNote, setEditingNote] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('all');
    const [currentTask, setCurrentTask] = useState({ title: '', description: '', priority: '', dueDate: '', status: '' });
    const [currentNote, setCurrentNote] = useState({ title: '', description: '' });

    useEffect(() => {
        getArchiveTask();
    }, [getArchiveTask]);

    // Filter tasks based on type and sortBy status
    const filteredTasks = archieve.tasks.filter((task) => {
        const today = new Date();
        const dueDate = new Date(task.dueDate);

        if (filter === 'all') {
            if (sortBy === 'all') {
                return true; // Show all tasks
            }
            if (sortBy === 'complete') {
                return task.status === 'completed'; // Show only completed tasks
            }
            if (sortBy === 'overdue') {
                return task.status === 'overdue' || (dueDate < today && task.status !== 'completed');
            }
        }

        if (filter === 'tasks') {
            if (sortBy === 'all') {
                return true; // Show all tasks
            }
            if (sortBy === 'complete') {
                return task.status === 'completed'; // Show only completed tasks
            }
            if (sortBy === 'overdue') {
                return task.status === 'overdue' || (dueDate < today && task.status !== 'completed');
            }
        }

        return false;
    });

    // Filter notes based on filter type
    const filteredNotes = archieve.notes.filter((note) => filter === 'all' || filter === 'notes');

    const openTaskModal = (task) => {
        setEditingTask(task);
        setTaskModalOpen(true);
        setCurrentTask(task); // Pre-fill the form with task data
    };

    const openNoteModal = (note) => {
        setEditingNote(note);
        setNoteModalOpen(true);
        setCurrentNote(note); // Pre-fill the form with note data
    };

    const closeTaskModal = () => setTaskModalOpen(false);
    const closeNoteModal = () => setNoteModalOpen(false);

    const saveTask = () => {
        // Logic to save or update task
        closeTaskModal();
    };

    const saveNote = () => {
        // Logic to save or update note
        closeNoteModal();
    };

    const getPriorityStyles = (priority) => {
        const lower = priority.toLowerCase();
        return lower === "low"
            ? "bg-green-100 text-green-700"
            : lower === "medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700";
    };

    return (
        <div className="mt-1">
            <section className="mb-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Archive</h2>
                <div className="flex justify-between items-center flex-wrap">
                    <div className="flex space-x-2">
                        {['all', 'tasks', 'notes'].map((f, index) => (
                            <button
                                className={`px-4 py-2 rounded ${filter === f ? 'bg-[#6e8378] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                key={index}
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

            {/* Displaying Tasks */}
            {filter !== 'notes' && filteredTasks.length > 0 ? (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`bg-white p-4 rounded shadow task-item ${task.status} hover:shadow-lg hover:scale-105 transition-all duration-300`}
                            onClick={() => openTaskModal(task)}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">{task.title}</h3>
                                <span
                                    className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityStyles(task.priority)}`}
                                >
                                    {task.priority}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-800">📅 {task.dueDate.slice(0, 10)}</h3>
                            <p className="font-bold text-gray-500">{task.timeDue}</p>
                            <p className="text-sm text-gray-500">{task.description}</p>
                            <p className="text-sm text-gray-500"><span>Status: </span>{task.status}</p>
                        </div>
                    ))}
                </section>
            ) : (
                filter === 'tasks' && <div>No tasks found</div>
            )}

            {/* Displaying Notes */}
            {filter === 'notes' && filteredNotes.length > 0 ? (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredNotes.map((note) => (
                        <div
                            key={note.id}
                            className="bg-white p-4 rounded shadow hover:shadow-lg hover:scale-105 transition-all duration-300"
                            onClick={() => openNoteModal(note)}
                        >
                            <h3 className="font-bold text-gray-800">{note.title}</h3>
                            <p className="text-sm text-gray-500">{note.description}</p>
                        </div>
                    ))}
                </section>
            ) : (
                filter === 'notes' && <div>No notes found</div>
            )}

            {/* Task Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md transition-all duration-300">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold">{editingTask ? "Edit Task" : "New Task"}</h2>
                        {/* Task form fields */}
                        <input
                            type="text"
                            placeholder="Task Title"
                            value={currentTask.title}
                            onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                            className="w-full p-3 mt-2 border rounded-md border-gray-300"
                        />
                        <textarea
                            placeholder="Task Description"
                            value={currentTask.description}
                            onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                            className="w-full p-3 mt-2 border rounded-md border-gray-300"
                        />
                        {/* Add other fields like priority and due date here */}

                        <div className="flex justify-between mt-4">
                            <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={closeTaskModal}>Cancel</button>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={saveTask}>
                                {editingTask ? "Save" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Note Modal */}
            {isNoteModalOpen && (
                <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg shadow-lg w-80">
                        <h2 className="text-lg font-semibold">{editingNote ? "Edit Note" : "Create Note"}</h2>
                        <input
                            type="text"
                            placeholder="Note Title"
                            value={currentNote.title}
                            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                            className="w-full p-3 mt-2 border rounded-md border-gray-300"
                        />
                        <textarea
                            placeholder="Note Description"
                            value={currentNote.description}
                            onChange={(e) => setCurrentNote({ ...currentNote, description: e.target.value })}
                            className="w-full p-3 mt-2 border rounded-md border-gray-300"
                        />

                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={saveNote}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                {editingNote ? "Save" : "Create"}
                            </button>
                            <button
                                onClick={closeNoteModal}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchiveMainContent;
