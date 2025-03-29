import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";

const TaskScheduler = () => {
    const [tasks, setTasks] = useState([
        {
            title: "Math Assignment",
            due: "2025-03-25T23:59",
            details: "Complete exercises 5 to 10 from the textbook.",
            status: "In Progress",
            priority: "High",
        },
    ]);

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);

    const openPopup = (task = null, index = null) => {
        setCurrentTask(
            task ? { ...task } : { title: "", due: "", details: "", status: "Pending", priority: "Medium" }
        );
        setEditingIndex(index);
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setCurrentTask(null);
        setEditingIndex(null);
    };

    const handleChange = (e) => {
        setCurrentTask({ ...currentTask, [e.target.name]: e.target.value });
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        const time = currentTask?.due?.split("T")[1] || "12:00";
        setCurrentTask({ ...currentTask, due: `${date}T${time}` });
    };

    const handleTimeChange = (e) => {
        const time = e.target.value;
        const date = currentTask?.due?.split("T")[0] || new Date().toISOString().split("T")[0];
        setCurrentTask({ ...currentTask, due: `${date}T${time}` });
    };

    const saveTask = () => {
        if (editingIndex !== null) {
            const updatedTasks = [...tasks];
            updatedTasks[editingIndex] = currentTask;
            setTasks(updatedTasks);
        } else {
            setTasks([...tasks, currentTask]);
        }
        closePopup();
    };

    const deleteTask = () => {
        if (editingIndex !== null) {
            const updatedTasks = tasks.filter((_, index) => index !== editingIndex);
            setTasks(updatedTasks);
        }
        closePopup();
    };

    const completeTask = (index) => {
        const updatedTasks = [...tasks];
        updatedTasks[index].status = "Completed";
        setTasks(updatedTasks);
    };

    return (
        <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {tasks.map((task, index) => (
                    <div
                        key={index}
                        className="p-5 bg-white rounded shadow relative border border-gray-200 cursor-pointer"
                        onClick={() => openPopup(task, index)}
                    >
                        <h2 className="font-semibold text-lg">{task.title}</h2>
                        <p className="text-gray-500 text-sm">Due: {task.due.replace("T", " ")}</p>
                        <p className="text-gray-600 text-sm">{task.details}</p>
                        <p className="text-gray-600 text-sm mt-2">
                            <strong>Status:</strong> {task.status}
                        </p>
                        <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">
                            {task.priority}
                        </span>
                        {task.status !== "Completed" && (
                            <button
                                className="mt-3 bg-green-500 text-white px-4 py-2 rounded"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    completeTask(index);
                                }}
                            >
                                Complete
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button
                className="fixed bottom-5 right-5 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 text-xl flex items-center justify-center"
                onClick={() => openPopup()}
            >
                <AiOutlinePlus size={24} />
            </button>

            {isPopupOpen && (
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md transition-all duration-300">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold">{editingIndex !== null ? "Edit Task" : "New Task"}</h2>
                        <input
                            type="text"
                            name="title"
                            className="w-full p-2 border rounded mt-2"
                            placeholder="Task Title"
                            value={currentTask?.title || ""}
                            onChange={handleChange}
                        />
                        <textarea
                            name="details"
                            className="w-full p-2 border rounded mt-2"
                            placeholder="Task Details"
                            value={currentTask?.details || ""}
                            onChange={handleChange}
                        ></textarea>
                        <input
                            type="date"
                            name="dueDate"
                            className="w-full p-2 border rounded mt-2"
                            value={currentTask?.due?.split("T")[0] || ""}
                            onChange={handleDateChange}
                        />
                        <input
                            type="time"
                            name="dueTime"
                            className="w-full p-2 border rounded mt-2"
                            value={currentTask?.due?.split("T")[1] || ""}
                            onChange={handleTimeChange}
                        />
                        <select name="status" className="w-full p-2 border rounded mt-2" value={currentTask?.status || ""} onChange={handleChange}>
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                        </select>
                        <select name="priority" className="w-full p-2 border rounded mt-2" value={currentTask?.priority || ""} onChange={handleChange}>
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                        <div className="flex justify-between mt-4">
                            {editingIndex !== null && (
                                <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={deleteTask}>
                                    Delete
                                </button>
                            )}
                            <div className="flex gap-2">
                                <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={closePopup}>Cancel</button>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={saveTask}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskScheduler;