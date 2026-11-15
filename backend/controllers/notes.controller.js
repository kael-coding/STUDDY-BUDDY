import Note from "../models/notes.model.js";
import { validSubject } from "../lib/utils/validSubject.js";

export const createNote = async (req, res) => {
    const { title, description, isPinned, subject } = req.body;

    if (!validSubject(subject)) return res.status(400).json({ message: "Subject must be text up to 60 characters." });
    if (!title || !description) {
        return res.status(400).json({
            success: false,
            message: "Title and description are required",
        });
    }

    let customId;
    let isUnique = false;
    while (!isUnique) {
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        customId = `300090${randomNum}`;
        const existingNotes = await Note.findOne({ _id: customId });
        if (!existingNotes) isUnique = true;
    }

    // Manually format the current date to 'MM/DD/YYYY'
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US");

    const newNote = new Note({
        _id: customId,
        userId: req.userId,
        title,
        description,
        subject,
        isPinned: isPinned || false,
        date: formattedDate,
    });

    await newNote.save();

    return res.status(201).json({
        success: true,
        message: "Note added successfully",
        note: newNote,
    });
};

export const getNotes = async (req, res) => {
    try {

        const { showArchived } = req.query;
        const filter = { userId: req.userId, deletedAt: null };


        if (showArchived !== 'true') {
            filter.isArchived = false;
        }

        const notes = await Note.find(filter).sort({ isPinned: -1 });

        return res.status(200).json({
            success: true,
            notes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch notes",
            error: error.message,
        });
    }
};


export const updateNote = async (req, res) => {
    const { id } = req.params;
    const { title, description, subject } = req.body;
    if (!validSubject(subject)) return res.status(400).json({ message: "Subject must be text up to 60 characters." });

    try {
        const updatedNote = await Note.findOneAndUpdate(
            { _id: id, userId: req.userId, deletedAt: null },
            { title, description, subject },
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note updated successfully",
            note: updatedNote,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update note",
            error: error.message,
        });
    }
};

export const getNote = async (req, res, next) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, userId: req.userId, deletedAt: null });
        if (!note) return res.status(404).json({ message: "Note not found." });
        res.json({ note });
    } catch (error) {
        next(error);
    }
};

export const deleteNote = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedNote = await Note.findOneAndUpdate(
            { _id: id, userId: req.userId, deletedAt: null },
            { $set: { deletedAt: new Date() } },
            { new: true },
        );

        if (!deletedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note moved to Trash",
            note: deletedNote,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete note",
            error: error.message,
        });
    }
};

export const pinNote = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedNote = await Note.findOneAndUpdate(
            { _id: id, userId: req.userId, deletedAt: null },
            { isPinned: true },
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note pinned successfully",
            note: updatedNote,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to pin note",
            error: error.message,
        });
    }
};

export const unpinNote = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedNote = await Note.findOneAndUpdate(
            { _id: id, userId: req.userId, deletedAt: null },
            { isPinned: false },
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note unpinned successfully",
            note: updatedNote,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to unpin note",
            error: error.message,
        });
    }
};

