import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: { type: String, trim: true, required: true, maxlength: 80 },
    subject: { type: String, trim: true, required: true, maxlength: 60 },
    description: { type: String, trim: true, required: true, maxlength: 500 },
    owner: { type: String, ref: "User", required: true },
    members: [{ type: String, ref: "User" }],
}, { timestamps: true });

schema.index({ owner: 1, createdAt: -1, _id: -1 });

export default mongoose.model("StudyGroup", schema);
