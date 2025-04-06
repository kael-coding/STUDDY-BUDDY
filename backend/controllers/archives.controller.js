import { Note } from "../models/notes.model.js";
export const archieveNote = async (req, res) => {
    const { id } = params;

    try {
        const note = await Note.findById(id);

        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }
        note.isArchived = !note.isArchived; // Toggle the isArchived status
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

export const getArchive = async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.userId, isArchived: true }).sort({ date: -1 });
        return res.status(200).json({
            success: true,
            archieved: {
                notes
            }
        });
    } catch (error) {

        console.error("Error in getArchive:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }

}