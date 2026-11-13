import User from "../models/user.model.js";
import Note from "../models/notes.model.js";
import Schedule from "../models/schedule.model.js";
import PostReport from "../models/postReport.model.js";

export const getAdminReportSummary = async (_req, res, next) => {
    try {
        const counts = await PostReport.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const summary = { pending: 0, removing: 0, dismissed: 0, removed: 0 };
        for (const { _id, count } of counts) summary[_id] = count;
        res.json({ summary });
    } catch (error) {
        next(error);
    }
};

export const getDashboardSummary = async (_req, res, next) => {
    try {
        const [accounts, tasks, notes, openReports] = await Promise.all([
            User.aggregate([
                { $match: { role: { $in: ["user", "admin"] } } },
                { $group: { _id: "$role", total: { $sum: 1 }, verified: { $sum: { $cond: ["$isVerified", 1, 0] } } } },
            ]),
            Schedule.countDocuments({ deletedAt: null }),
            Note.countDocuments({ deletedAt: null }),
            PostReport.countDocuments({ status: { $in: ["pending", "removing"] } }),
        ]);
        res.json({ accounts, tasks, notes, openReports });
    } catch (error) {
        next(error);
    }
};

export const getAllUsersWithStats = async (req, res) => {
    try {
        const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
        const pattern = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const users = await User.find({
            role: { $ne: "superadmin" },
            $or: [
                { userName: { $regex: pattern, $options: "i" } },
                { email: { $regex: pattern, $options: "i" } },
            ],
        }).select("-password");

        const stats = await Promise.all(
            users.map(async (user) => {
                const taskCount = await Schedule.countDocuments({ userId: user._id, deletedAt: null });
                const noteCount = await Note.countDocuments({ userId: user._id, deletedAt: null });
                return {
                    _id: user._id,
                    userName: user.userName,
                    email: user.email,
                    isVerified: user.isVerified,
                    role: user.role,
                    taskCount,
                    noteCount,
                };
            })
        );

        res.status(200).json({ success: true, users: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id, role: { $ne: "superadmin" } });
        if (!user) return res.status(404).json({ success: false, message: "Manageable account not found." });
        res.json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
