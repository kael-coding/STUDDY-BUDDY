import cron from "node-cron";
import Schedule from "../models/schedule.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { taskDeadline } from "../lib/utils/taskDeadline.js";
import {
    sendPastDueNotification,
    sendOneDayBefore,
    sendOneHourBefore,
} from "../middleware/nodemailer/email.js";

const activeTask = {
    deletedAt: null,
    isArchived: { $ne: true },
    isCompleted: { $ne: true },
    status: { $ne: "completed" },
};
const minute = 60_000;
const reminders = new Map([
    [24 * 60, {
        flag: "isOneDayBeforeNotified",
        sendEmail: sendOneDayBefore,
        type: "reminder",
        context: "is due in one day.",
    }],
    [60, {
        flag: "isOneHourBeforeNotified",
        sendEmail: sendOneHourBefore,
        type: "reminder",
        context: "is due in one hour.",
    }],
    [0, {
        flag: "isPastDueNotified",
        sendEmail: sendPastDueNotification,
        type: "overDue",
        context: "is past due and has been marked as OverDue.",
    }],
]);

export const runTaskReminders = async (now = Date.now()) => {
    const currentMinute = Math.floor(now / minute) * minute;
    const tasks = await Schedule.find(activeTask);
    for (const task of tasks) {
        const deadline = taskDeadline(task);
        if (!deadline.isValid()) continue;

        const currentSchedule = {
            ...activeTask,
            _id: task._id,
            dueDate: task.dueDate,
            timeDue: task.timeDue,
        };
        const minutesUntilDue = (deadline.valueOf() - currentMinute) / minute;
        if (minutesUntilDue <= 0 && task.status !== "OverDue") {
            await Schedule.updateOne(currentSchedule, { $set: { status: "OverDue" } });
        }

        const reminder = reminders.get(minutesUntilDue);
        if (!reminder || task[reminder.flag]) continue;

        const user = await User.findById(task.userId);
        if (!user) continue;

        const claimed = await Schedule.updateOne(
            { ...currentSchedule, [reminder.flag]: { $ne: true } },
            { $set: { [reminder.flag]: true } },
        );
        if (!claimed.modifiedCount) continue;

        try {
            await Notification.create({
                userId: task.userId,
                taskId: task._id,
                type: reminder.type,
                text: `Your task ${task.title}`,
                context: reminder.context,
            });
        } catch (error) {
            await Schedule.updateOne(currentSchedule, { $set: { [reminder.flag]: false } });
            throw error;
        }
        await reminder.sendEmail(user.email, task);
    }
};

cron.schedule("* * * * *", async () => {
    try {
        await runTaskReminders();
    } catch (error) {
        console.error("Error running task reminders:", error);
    }
});

export default cron;
