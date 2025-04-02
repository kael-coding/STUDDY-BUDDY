import mongoose from "mongoose";
const scheduleSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        userId: { type: String, ref: "User", required: true },
        title: { type: String, required: true },
        description: { type: String },
        startDate: { type: Date, required: true },
        dueDate: { type: Date, required: true },
        priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
        timeDue: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        status: { type: String, enum: ["Pending", "OverDue", "completed"], default: "Pending" },

        isNotified: { type: Boolean, default: false },
        isPastDueNotified: { type: Boolean, default: false },
        isOneDayBeforeNotified: { type: Boolean, default: false },
        isOneHourBeforeNotified: { type: Boolean, default: false },
    },
    { timestamps: true }
); export const Schedule = mongoose.model("Schedule", scheduleSchema);
