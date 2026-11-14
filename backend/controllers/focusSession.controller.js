import moment from "moment-timezone";
import FocusSession from "../models/focusSession.model.js";
import Schedule from "../models/schedule.model.js";

const settleExpired = (userId, now) => FocusSession.updateMany(
    { userId, status: "active", endsAt: { $lte: now } },
    { $set: { status: "completed" } },
);

export const getFocusProgress = async (req, res, next) => {
    try {
        const { userId } = req;
        const now = new Date();
        const week = moment.tz(now, "Asia/Manila").startOf("isoWeek");
        await settleExpired(userId, now);
        const [active, daily] = await Promise.all([
            FocusSession.findOne({ userId, status: "active" }).select("minutes endsAt taskTitle").lean(),
            FocusSession.aggregate([
                { $match: { userId, status: "completed", endsAt: { $gte: week.toDate(), $lte: now } } },
                { $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$endsAt", timezone: "Asia/Manila" } },
                    minutes: { $sum: "$minutes" },
                    sessions: { $sum: 1 },
                } },
            ]),
        ]);
        const counts = new Map(daily.map(({ _id, minutes, sessions }) => [_id, { minutes, sessions }]));
        const days = Array.from({ length: 7 }, (_, index) => {
            const date = week.clone().add(index, "days").format("YYYY-MM-DD");
            return { date, ...(counts.get(date) || { minutes: 0, sessions: 0 }) };
        });
        res.json({ active, days, serverTime: now });
    } catch (error) {
        next(error);
    }
};

export const startFocusSession = async (req, res, next) => {
    const { minutes, taskId } = req.body || {};
    if (![15, 25, 50].includes(minutes) || (taskId !== undefined && (typeof taskId !== "string" || !taskId))) {
        return res.status(400).json({ message: "Choose a valid focus duration and task." });
    }
    try {
        let task;
        if (taskId) {
            task = await Schedule.findOne({
                _id: taskId, userId: req.userId, deletedAt: null, isArchived: false,
                isCompleted: { $ne: true }, status: { $ne: "completed" },
            }).select("title");
            if (!task) return res.status(404).json({ message: "This task is unavailable for a focus session." });
        }
        await FocusSession.init();
        const now = new Date();
        await settleExpired(req.userId, now);
        const session = await FocusSession.create({
            userId: req.userId,
            taskId,
            taskTitle: task?.title,
            minutes,
            endsAt: new Date(now.getTime() + minutes * 60_000),
        });
        res.status(201).json({ active: session, serverTime: now });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: "A focus session is already running." });
        next(error);
    }
};

export const cancelFocusSession = async (req, res, next) => {
    const now = new Date();
    try {
        if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ message: "Invalid session ID." });
        await FocusSession.updateOne(
            { _id: req.params.id, userId: req.userId, status: "active", endsAt: { $gt: now } },
            { $set: { status: "cancelled" } },
        );
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};
