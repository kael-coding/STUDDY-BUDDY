import Note from "../models/notes.model.js";
import Schedule from "../models/schedule.model.js";


export const archieveNote = async (req, res) => {
    const { id } = req.params;

    try {
        const note = await Note.findOne({ _id: id, userId: req.userId, deletedAt: null });

        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }
        note.isArchived = true // Toggle the isArchived status
        await note.save();
        return res.status(200).json({
            success: true,
            message: note.isArchived ? "Note archived successfully" : "Note unarchived successfully",
            note
        });

        console.log(notes)
    } catch (error) {
        console.error("Error in archiveNote:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}
export const unArchieveNote = async (req, res) => {
    const { id } = req.params;

    try {
        const note = await Note.findOne({ _id: id, userId: req.userId, deletedAt: null });

        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }
        note.isArchived = false
        await note.save();
        return res.status(200).json({
            success: true,
            message: note.isArchived ? "Note archived successfully" : "Note unarchived successfully",
            note
        });
    } catch (error) {
        console.error("Error in archiveNote:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export const archiveTask = async (req, res) => {
    const { id } = req.params;
    try {
        const task = await Schedule.findOne({ _id: id, userId: req.userId, deletedAt: null });
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }
        task.isArchived = !task.isArchived;
        await task.save();
        return res.status(200).json({
            success: true,
            message: task.isArchived ? "Task archived successfully" : "Task unarchived successfully",
            task
        });
    } catch (error) {
        console.error("Error in archiveTask:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
export const getArchive = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        const notes = await Note.find({ userId: req.userId, isArchived: true, deletedAt: null }).sort({ date: -1 });
        const tasks = await Schedule.find({ userId: req.userId, isArchived: true, deletedAt: null }).sort({ dueDate: -1 });

        return res.status(200).json({
            success: true,
            archived: {
                notes,
                tasks
            }
        });
    } catch (error) {
        console.error("Error in getArchive:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
