import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        userId: { type: String, ref: "User", required: true },
        title: { type: String, required: true },
        assessmentType: { type: String, enum: ["task", "quiz", "exam", "assignment"], default: "task" },
        topics: [{
            title: { type: String, required: true, trim: true, maxlength: 160 },
            done: { type: Boolean, default: false },
        }],
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

        subject: { type: String, trim: true, maxlength: 60, default: "" },
        deletedAt: { type: Date, default: null },
        noteId: { type: String, ref: "Note", default: null },
        isArchived: { type: Boolean, default: false },
        badges: [{
            name: String,
            earnedAt: { type: Date, default: Date.now },
            level: Number,
            description: String,
            icon: String
        }],
    },

    { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);


export default Schedule;
