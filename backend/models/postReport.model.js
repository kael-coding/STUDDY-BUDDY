import mongoose from "mongoose";

const postReportSchema = new mongoose.Schema({
    postId: { type: String, ref: "Post", required: true },
    reporterId: { type: String, ref: "User", required: true },
    reason: { type: String, required: true, trim: true, maxlength: 300 },
    status: {
        type: String,
        enum: ["pending", "dismissed", "removing", "removed"],
        default: "pending",
    },
    reviewedBy: { type: String, ref: "User" },
    reviewedAt: Date,
}, { timestamps: true });

postReportSchema.index({ postId: 1, reporterId: 1 }, { unique: true });
postReportSchema.index({ status: 1, createdAt: 1 });

export default mongoose.model("PostReport", postReportSchema);
