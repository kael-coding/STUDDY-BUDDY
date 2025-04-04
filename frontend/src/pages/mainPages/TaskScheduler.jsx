import { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useTaskStore } from "../../store/taskStore";
const TaskScheduler = () => {
    const { tasks = [], getTasks, createTask, updateTask, deleteTask } = useTaskStore();

    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState({
        title: "",
        startDate: "",
        dueDate: "",
        timeDue: "",
        description: "",
        status: "pending",
        priority: "Medium",
    });

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchTasks = async () => {
        setIsLoading(true);
        await getTasks();
        setIsLoading(false);
    };

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [isOverdue, setIsOverdue] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [taskToComplete, setTaskToComplete] = useState(null);

    const openPopup = (task = null) => {
        if (task) {
            setForm({
                title: task.title || "",
                startDate: formatDate(task.startDate) || "",
                dueDate: formatDate(task.dueDate) || "",
                timeDue: task.timeDue || "",
                description: task.description || "",
                status: task.status.toLowerCase(),
                priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
            });
            setEditingTaskId(task._id);
            setIsOverdue(isTaskOverdue(task));
        } else {
            setForm({
                title: "",
                startDate: "",
                dueDate: "",
                timeDue: "",
                description: "",
                status: "pending",
                priority: "Medium",
            });
            setEditingTaskId(null);
            setIsOverdue(false);
        }
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setEditingTaskId(null);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const formatDate = (date) => (date ? new Date(date).toISOString().split("T")[0] : "");

    const saveTask = async () => {
        const formattedTask = {
            title: form.title,
            description: form.description,
            startDate: form.startDate,
            dueDate: form.dueDate,
            timeDue: form.timeDue || "00:00",
            status: form.status,
            priority: form.priority.toLowerCase(),
        };

        if (editingTaskId) {
            await updateTask(editingTaskId, formattedTask);
        } else {
            await createTask(formattedTask);
        }

        closePopup();
        fetchTasks();
    };

    const confirmDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const closeDeleteConfirm = () => {
        setIsDeleteModalOpen(false);
    };

    const handleDelete = async () => {
        if (editingTaskId) {
            await deleteTask(editingTaskId);
            closePopup();
            setEditingTaskId(null);
        }
        setIsDeleteModalOpen(false);
        fetchTasks();
    };

    const getPriorityStyles = (priority) => {
        const lower = priority.toLowerCase();
        return lower === "low"
            ? "bg-green-100 text-green-700"
            : lower === "medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700";
    };

    const openCompleteModal = (task) => {
        setTaskToComplete(task);
        setIsCompleteModalOpen(true);
    };

    const closeCompleteModal = () => {
        setIsCompleteModalOpen(false);
        setTaskToComplete(null);
    };

    const handleComplete = async () => {
        if (taskToComplete) {
            const updatedTask = { ...taskToComplete, status: "completed" };
            await updateTask(taskToComplete._id, updatedTask);
            closeCompleteModal();
            fetchTasks();
        }
    };

    const isTaskOverdue = (task) => {
        const now = new Date();
        const due = new Date(task.dueDate);
        const [hours, minutes] = task.timeDue.split(":");
        due.setHours(hours, minutes);
        return now > due;
    };

    return (
        <div className="p-5">
            <h1 className="text-3xl font-semibold mb-5 text-gray-800">Task Scheduler</h1>
            {isLoading ? (
                <p className="text-center text-gray-500">Loading tasks...</p>
            ) : tasks.length === 0 ? (
                <p className="text-center text-gray-500">No tasks available. Click the + button to add a task.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                        <div
                            key={task._id}
                            className="p-5 bg-white rounded shadow border cursor-pointer relative"
                            onClick={() => openPopup(task)}
                        >
                            <h2 className="font-semibold text-lg">{task.title}</h2>
                            <p className="text-gray-500 text-sm">
                                Due: {task.dueDate.split("T")[0]} {task.timeDue}
                            </p>
                            <p className="text-gray-600 text-sm">
                                <strong>Description:</strong> {task.description}
                            </p>
                            <p className="text-gray-600 text-sm mt-2">
                                <strong>Status:</strong> {task.status}
                            </p>
                            <span
                                className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${getPriorityStyles(task.priority)}`}
                            >
                                {task.priority}
                            </span>
                            {task.status.toLowerCase() !== "completed" && !isTaskOverdue(task) && (
                                <button
                                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openCompleteModal(task);
                                    }}
                                >
                                    Complete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button
                className="fixed bottom-5 right-5 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 text-xl flex items-center justify-center"
                onClick={() => openPopup()}
            >
                <AiOutlinePlus size={24} />
            </button>

            {/* Popup Form */}
            {isPopupOpen && (
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md transition-all duration-300">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold">{editingTaskId ? "Edit Task" : "New Task"}</h2>

                        <label className="block text-sm font-medium text-gray-700 mt-2">Task Title</label>
                        <input
                            type="text"
                            name="title"
                            className="w-full p-2 border rounded mt-1"
                            value={form.title}
                            onChange={handleChange}
                            disabled={form.status === "completed"}
                        />

                        <label className="block text-sm font-medium text-gray-700 mt-2">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            className="w-full p-2 border rounded mt-1"
                            value={form.startDate}
                            onChange={handleChange}
                            disabled={form.status === "completed"}
                        />

                        <label className="block text-sm font-medium text-gray-700 mt-2">Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            className="w-full p-2 border rounded mt-1"
                            value={form.dueDate}
                            onChange={handleChange}
                            disabled={form.status === "completed"}
                        />

                        <label className="block text-sm font-medium text-gray-700 mt-2">Due Time</label>
                        <input
                            type="time"
                            name="timeDue"
                            className="w-full p-2 border rounded mt-1"
                            value={form.timeDue}
                            onChange={handleChange}
                            disabled={form.status === "completed"}
                        />

                        <label className="block text-sm font-medium text-gray-700 mt-2">Task Details</label>
                        <textarea
                            name="description"
                            className="w-full p-2 border rounded mt-1"
                            value={form.description}
                            onChange={handleChange}
                            disabled={form.status === "completed"}
                        />

                        <label className="block text-sm font-medium text-gray-700 mt-2">Priority</label>
                        <select
                            name="priority"
                            className="w-full p-2 border rounded mt-1"
                            value={form.priority}
                            onChange={handleChange}
                            disabled={form.status === "completed"}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>

                        <div className="flex justify-between mt-4">
                            <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={closePopup}>
                                Cancel
                            </button>
                            {editingTaskId && (
                                <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={confirmDelete}>
                                    🗑 Delete
                                </button>
                            )}
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                onClick={saveTask}
                                disabled={form.status === "completed"}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-30">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold text-center">Confirm Deletion</h2>
                        <p className="text-center">Are you sure you want to delete this task?</p>
                        <div className="flex justify-between mt-5">
                            <button onClick={closeDeleteConfirm} className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Modal */}
            {isCompleteModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                        <h2 className="text-lg font-bold">Confirm Task Completion</h2>
                        <p className="text-gray-600 mt-2">Are you sure you want to mark this task as completed?</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={closeCompleteModal}>
                                Cancel
                            </button>
                            <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleComplete}>
                                Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskScheduler;
