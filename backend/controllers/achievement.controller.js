import { achievements, longestStudyStreak } from "../config/achievements.js";
import Schedule from "../models/schedule.model.js";
import Note from "../models/notes.model.js";
import FocusSession from "../models/focusSession.model.js";
import StudyGroup from "../models/studyGroup.model.js";
import StudentAchievement from "../models/studentAchievement.model.js";

export async function getAchievements(req, res, next) {
    const { userId } = req;
    const now = new Date();
    try {
        const [assessments, noteTotals, days, groups, saved] = await Promise.all([
            Schedule.countDocuments({ userId, deletedAt: null, $or: [{ isCompleted: true }, { status: "completed" }] }),
            Note.aggregate([
                { $match: { userId, deletedAt: null } },
                { $group: { _id: null, notes: { $sum: 1 }, flashcards: { $sum: { $size: { $ifNull: ["$flashcards", []] } } } } },
            ]),
            FocusSession.aggregate([
                { $match: { userId, status: { $in: ["active", "completed"] }, pausedRemainingMs: null, endsAt: { $lte: now } } },
                { $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$endsAt", timezone: "Asia/Manila" } },
                    minutes: { $sum: "$minutes" },
                } },
                { $sort: { _id: 1 } },
            ]),
            StudyGroup.countDocuments({ owner: userId }),
            StudentAchievement.findById(userId).select("earned").lean(),
        ]);
        const { notes = 0, flashcards = 0 } = noteTotals[0] ?? {};
        const stats = {
            assessments, notes, flashcards, groups,
            minutes: days.reduce((total, day) => total + day.minutes, 0),
            streak: longestStudyStreak(days.map((day) => day._id)),
        };
        const earned = new Set(saved?.earned);
        const unlocked = achievements.filter(({ id, metric, target }) => !earned.has(id) && stats[metric] >= target);
        if (unlocked.length) {
            const record = await StudentAchievement.findOneAndUpdate(
                { _id: userId }, { $addToSet: { earned: { $each: unlocked.map(({ id }) => id) } } },
                { upsert: true, new: true },
            ).lean();
            for (const id of record.earned) earned.add(id);
        }

        res.json({ achievements: achievements.map(({ metric, ...achievement }) => ({
            ...achievement,
            progress: Math.min(stats[metric], achievement.target),
            earned: earned.has(achievement.id),
        })) });
    } catch (error) {
        next(error);
    }
}
