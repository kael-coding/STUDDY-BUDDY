import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        userId: { type: String, ref: "User", required: true },
        title: { type: String, required: true },
        description: { type: String },
        isPinned: { type: Boolean, default: false },
        isArchived: { type: Boolean, default: false },
        date: { type: String, required: true }, // Store date as string in MM/DD/YYYY format
    },
    { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
