import User from "../models/user.model.js";
import Note from "../models/notes.model.js";
import Schedule from "../models/schedule.model.js";
import PostReport from "../models/postReport.model.js";
import moment from "moment-timezone";

export const getAdminReportSummary = async (_req, res, next) => {
    try {
        const [counts, recentReports] = await Promise.all([PostReport.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]), PostReport.find().sort({ createdAt: -1, _id: -1 }).limit(10)
            .select("postId reason status createdAt").populate("postId", "text subject image").lean()]);
        const summary = { pending: 0, removing: 0, dismissed: 0, removed: 0 };
        for (const { _id, count } of counts) summary[_id] = count;
        res.json({ summary, recentReports });
    } catch (error) {
        next(error);
    }
};

export const getDashboardSummary = async (_req, res, next) => {
    try {
        const month = moment.tz("Asia/Manila").startOf("month");
        const firstMonth = month.clone().subtract(5, "months");
        const [accounts, tasks, notes, openReports, monthlyCounts] = await Promise.all([
            User.aggregate([
                { $group: { _id: "$role", total: { $sum: 1 }, verified: { $sum: { $cond: ["$isVerified", 1, 0] } } } },
            ]),
            Schedule.countDocuments({ deletedAt: null }),
            Note.countDocuments({ deletedAt: null }),
            PostReport.countDocuments({ status: { $in: ["pending", "removing"] } }),
            User.aggregate([
                { $match: { createdAt: { $gte: firstMonth.toDate(), $lte: new Date() } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "Asia/Manila" } }, count: { $sum: 1 } } },
            ]),
        ]);
        const byMonth = new Map(monthlyCounts.map(({ _id, count }) => [_id, count]));
        const registrations = Array.from({ length: 6 }, (_, index) => {
            const key = firstMonth.clone().add(index, "months").format("YYYY-MM");
            return { month: key, count: byMonth.get(key) ?? 0 };
        });
        res.json({ accounts, tasks, notes, openReports, registrations });
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
