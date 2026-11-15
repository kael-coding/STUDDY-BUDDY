import User from "../models/user.model.js";
import Note from "../models/notes.model.js";
import Schedule from "../models/schedule.model.js";
import PostReport from "../models/postReport.model.js";
import StudyGroup from "../models/studyGroup.model.js";
import moment from "moment-timezone";

export const getAdminReportSummary = async (_req, res, next) => {
    try {
        const [counts, recentReports] = await Promise.all([PostReport.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]), PostReport.find().sort({ createdAt: -1, _id: -1 }).limit(10)
            .select("postId reason status createdAt")
            .populate({ path: "postId", select: "text subject image studyGroup", populate: { path: "studyGroup", select: "name" } })
            .lean()]);
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
        const [accounts, tasks, notes, openReports, monthlyCounts, studyGroups] = await Promise.all([
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
            StudyGroup.countDocuments(),
        ]);
        const byMonth = new Map(monthlyCounts.map(({ _id, count }) => [_id, count]));
        const registrations = Array.from({ length: 6 }, (_, index) => {
            const key = firstMonth.clone().add(index, "months").format("YYYY-MM");
            return { month: key, count: byMonth.get(key) ?? 0 };
        });
        res.json({ accounts, tasks, notes, openReports, registrations, studyGroups });
    } catch (error) {
        next(error);
    }
};

export const getAllUsersWithStats = async (req, res) => {
    try {
        const { role = "all" } = req.query;
        const page = Number(req.query.page ?? 1);
        const pageSize = 25;
        if (!["all", "user", "admin"].includes(role) || !Number.isSafeInteger(page) || page < 1 || page > Math.floor(Number.MAX_SAFE_INTEGER / pageSize)) {
            return res.status(400).json({ message: "Invalid account filter or page." });
        }

        const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 120) : "";
        const pattern = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const filter = { role: role === "all" ? { $in: ["user", "admin"] } : role };
        if (search) {
            filter.$or = [
                { userName: { $regex: pattern, $options: "i" } },
                { email: { $regex: pattern, $options: "i" } },
            ];
        }
        const total = await User.countDocuments(filter);
        const pages = Math.max(1, Math.ceil(total / pageSize));
        const currentPage = Math.min(page, pages);
        const users = await User.find(filter).select("userName email isVerified role profilePicture createdAt")
            .sort({ createdAt: -1, _id: -1 }).skip((currentPage - 1) * pageSize).limit(pageSize).lean();

        const stats = await Promise.all(
            users.map(async (user) => {
                const owner = { userId: user._id, deletedAt: null };
                const [taskCount, noteCount] = await Promise.all([Schedule.countDocuments(owner), Note.countDocuments(owner)]);
                return {
                    _id: user._id,
                    userName: user.userName,
                    email: user.email,
                    isVerified: user.isVerified,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    createdAt: user.createdAt,
                    taskCount,
                    noteCount,
                };
            })
        );

        res.status(200).json({ success: true, users: stats, page: currentPage, pages, total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id, role: "user" });
        if (!user) return res.status(404).json({ success: false, message: "Student account not found." });
        res.json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
