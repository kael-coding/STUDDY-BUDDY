import mongoose from "mongoose";
import Note from "../models/notes.model.js";

export const addFlashcard = async (req, res, next) => {
    const { question, answer } = req.body || {};
    const validText = (value, limit) => typeof value === "string" && value.trim().length > 0 && value.trim().length <= limit;
    if (!validText(question, 300) || !validText(answer, 2000)) {
        return res.status(400).json({ message: "Enter a question and answer within the character limits." });
    }
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId, deletedAt: null, "flashcards.99": { $exists: false } },
            { $push: { flashcards: { question, answer } } },
            { new: true, runValidators: true },
        );
        if (!note) return res.status(404).json({ message: "Note unavailable or its 100-card limit has been reached." });
        res.status(201).json({ note });
    } catch (error) {
        next(error);
    }
};

export const updateFlashcard = async (req, res, next) => {
    const { id, cardId } = req.params;
    const removing = req.method === "DELETE";
    const reviewAgain = req.body?.reviewAgain;
    if (!mongoose.isObjectIdOrHexString(cardId) || (!removing && typeof reviewAgain !== "boolean")) {
        return res.status(400).json({ message: "Invalid flashcard update." });
    }
    try {
        const note = await Note.findOneAndUpdate(
            { _id: id, userId: req.userId, deletedAt: null, "flashcards._id": cardId },
            removing ? { $pull: { flashcards: { _id: cardId } } } : { $set: { "flashcards.$.reviewAgain": reviewAgain } },
            { new: true },
        );
        if (!note) return res.status(404).json({ message: "Flashcard not found." });
        res.json({ note });
    } catch (error) {
        next(error);
    }
};
