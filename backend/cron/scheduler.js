import cron from "node-cron";
import { Schedule } from "../models/schedule.model.js";
import { User } from "../models/user.model.js";
import {
    sendPastDueNotification,
    sendTaskStartingSoonReminder,
    sendOneDayBefore,
} from "../middleware/nodemailer/email.js";

// current time function
const getPhilippineTime = () => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
};

cron.schedule("* * * * *", async () => {
    const now = getPhilippineTime();
    const nowHour = now.getHours();
    const nowMinute = now.getMinutes();
    console.log(` Cron job running at ${now.toLocaleString("en-PH", { timeZone: "Asia/Manila" })}`);

    try {
        // -----------------  EXACTLY AT TASK DUE TIME -----------------
        const exactDueTasks = await Schedule.find({
            isPastDueNotified: false,
            isCompleted: false
        });

        for (const task of exactDueTasks) {
            const taskDueDate = new Date(task.dueDate);
            const [taskHour, taskMinute] = task.timeDue.split(":").map(Number);
            taskDueDate.setHours(taskHour, taskMinute, 0, 0);

            if (taskDueDate.getHours() === nowHour && taskDueDate.getMinutes() === nowMinute) {
                const user = await User.findById(task.userId);
                if (!user) continue;

                console.log(` Sending past due notification to ${user.email} for task: ${task.title}`);
                await sendPastDueNotification(user.email, task);
                await Schedule.updateOne({ _id: task._id }, { $set: { isPastDueNotified: true } });
            }
        }

        // -----------------  TASKS STARTING SOON (1 HOUR BEFORE) -----------------
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        const tasksStartingSoon = await Schedule.find({
            isNotified: false,
            isPastDueNotified: false,
            isCompleted: false
        });

        for (const task of tasksStartingSoon) {
            const taskStartDate = new Date(task.startDate);
            const [taskHour, taskMinute] = task.timeDue.split(":").map(Number);
            taskStartDate.setHours(taskHour, taskMinute, 0, 0);

            if (taskStartDate.getHours() === oneHourLater.getHours() &&
                taskStartDate.getMinutes() === oneHourLater.getMinutes()) {
                const user = await User.findById(task.userId);
                if (!user) continue;

                console.log(` Sending "starting soon" reminder to ${user.email} for task: ${task.title}`);
                await sendTaskStartingSoonReminder(user.email, task);
                await Schedule.updateOne({ _id: task._id }, { $set: { isNotified: true } });
            }
        }

        // -----------------  TASKS DUE TOMORROW -----------------
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const tasksDueTomorrow = await Schedule.find({
            isOneDayBeforeNotified: false,
            isPastDueNotified: false,
            isCompleted: false
        });

        for (const task of tasksDueTomorrow) {
            const taskDueDate = new Date(task.dueDate);
            const [taskHour, taskMinute] = task.timeDue.split(":").map(Number);
            taskDueDate.setHours(taskHour, taskMinute, 0, 0);

            if (taskDueDate.toDateString() === tomorrow.toDateString()) {
                const user = await User.findById(task.userId);
                if (!user) continue;

                console.log(`Sending one-day-before reminder to ${user.email} for task: ${task.title}`);
                await sendOneDayBefore(user.email, task);
                await Schedule.updateOne({ _id: task._id }, { $set: { isOneDayBeforeNotified: true } });
            }
        }
    } catch (err) {
        console.error(" Error running cron job:", err);
    }
});

export default cron;
