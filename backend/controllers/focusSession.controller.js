import moment from "moment-timezone";
import FocusSession from "../models/focusSession.model.js";
import Schedule from "../models/schedule.model.js";

const breakMs = 5 * 60_000;
const maxBreaks = 2;
const timerFields = "minutes endsAt taskTitle pausedRemainingMs breakEndsAt breaksUsed __v";

const settleExpired = (userId, now) => FocusSession.updateMany(
    { userId, status: "active", pausedRemainingMs: null, endsAt: { $lte: now } },
    { $set: { status: "completed" } },
);

export const getFocusProgress = async (req, res, next) => {
    try {
        const { userId } = req;
        const now = new Date();
        const week = moment.tz(now, "Asia/Manila").startOf("isoWeek");
        await settleExpired(userId, now);
        const [active, daily] = await Promise.all([
            FocusSession.findOne({ userId, status: "active" }).select(timerFields).lean(),
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
        if (error.code === 11000) return res.status(409).json({ message: "A focus session is already active." });
        next(error);
    }
};

export const updateFocusTimer = async (req, res, next) => {
    const { id } = req.params;
    const { action, revision } = req.body || {};
    if (!/^[a-f\d]{24}$/i.test(id) || !["pause", "resume", "break"].includes(action)
        || !Number.isSafeInteger(revision) || revision < 0) {
        return res.status(400).json({ message: "Invalid focus timer action." });
    }

    try {
        const filter = { _id: id, userId: req.userId, status: "active", __v: revision || { $in: [0, null] } };
        const session = await FocusSession.findOne(filter).select(timerFields).lean();
        const now = new Date();
        const conflict = () => res.status(409).json({ message: "The timer has changed. Check its current status." });
        if (!session) return conflict();

        const paused = session.pausedRemainingMs != null;
        const resting = session.breakEndsAt > now;
        const focusRemainingMs = session.pausedRemainingMs ?? (session.endsAt - (resting ? session.breakEndsAt : now));
        if (focusRemainingMs <= 0) return conflict();

        const fields = { pausedRemainingMs: null, breakEndsAt: null };
        if (action === "pause") {
            if (paused || resting) return conflict();
            fields.pausedRemainingMs = focusRemainingMs;
        } else if (action === "resume") {
            if (!paused && !resting) return res.json({ active: session, serverTime: now });
            fields.endsAt = new Date(now.getTime() + focusRemainingMs);
        } else {
            const breaksUsed = session.breaksUsed ?? 0;
            if (resting) return conflict();
            if (breaksUsed >= maxBreaks) return res.status(409).json({ message: "You've used both breaks for this session." });

            // The focus deadline already includes the break, so focus resumes even with the page closed.
            fields.breakEndsAt = new Date(now.getTime() + breakMs);
            fields.endsAt = new Date(fields.breakEndsAt.getTime() + focusRemainingMs);
            fields.breaksUsed = breaksUsed + 1;
        }

        const active = await FocusSession.findOneAndUpdate(filter, {
            $set: fields, $inc: { __v: 1 },
        }, { new: true }).select(timerFields).lean();
        if (!active) return conflict();
        return res.json({ active, serverTime: now });
    } catch (error) {
        next(error);
    }
};

export const cancelFocusSession = async (req, res, next) => {
    const now = new Date();
    try {
        if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ message: "Invalid session ID." });
        const result = await FocusSession.updateOne(
            { _id: req.params.id, userId: req.userId, status: "active", $or: [
                { pausedRemainingMs: { $gt: 0 } },
                { endsAt: { $gt: now } },
            ] },
            { $set: { status: "cancelled" } },
        );
        if (!result.matchedCount) return res.status(409).json({ message: "This focus session is no longer active." });
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};
