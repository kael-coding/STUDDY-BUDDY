import mongoose from "mongoose";

const focusSessionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    taskId: String,
    taskTitle: String,
    minutes: { type: Number, required: true },
    endsAt: { type: Date, required: true },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
}, { timestamps: true });

focusSessionSchema.index({ userId: 1 }, {
    unique: true,
    partialFilterExpression: { status: "active" },
});
focusSessionSchema.index({ userId: 1, status: 1, endsAt: 1 });

export default mongoose.model("FocusSession", focusSessionSchema);
