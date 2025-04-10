import cron from "node-cron";
import Schedule from "../models/schedule.model.js";
import User from "../models/user.model.js";
import {
    sendPastDueNotification,
    sendOneDayBefore,
    sendOneHourBefore,
} from "../middleware/nodemailer/email.js";

// if (process.env.NODE_ENV === "production") {
const getPhilippineTime = () => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
};

cron.schedule("* * * * *", async () => {
    const now = getPhilippineTime();
    const nowHour = now.getHours();
    const nowMinute = now.getMinutes();
    console.log(`Cron job running at ${now.toLocaleString("en-PH", { timeZone: "Asia/Manila" })}`);

    try {
        // Update overdue tasks
        const pastDueTasks = await Schedule.find({ isCompleted: false, status: { $ne: "OverDue" } });
        for (const task of pastDueTasks) {
            const taskDueDate = new Date(task.dueDate);
            const [taskHour, taskMinute] = task.timeDue.split(":").map(Number);
            taskDueDate.setHours(taskHour, taskMinute, 0, 0);

            if (now >= taskDueDate) {
                console.log(`Updating task status to OverDue: ${task.title}`);
                await Schedule.updateOne({ _id: task._id }, { $set: { status: "OverDue" } });
            }
        }

        // Send past due notifications
        const exactDueTasks = await Schedule.find({ isPastDueNotified: false, isCompleted: false });
        for (const task of exactDueTasks) {
            const taskDueDate = new Date(task.dueDate);
            const [taskHour, taskMinute] = task.timeDue.split(":").map(Number);
            taskDueDate.setHours(taskHour, taskMinute, 0, 0);

            if (taskDueDate.getTime() === now.getTime()) {
                const user = await User.findById(task.userId);
                if (!user) continue;

                console.log(`Sending past due notification to ${user.email} for task: ${task.title}`);
                await sendPastDueNotification(user.email, task);
                await Schedule.updateOne({ _id: task._id }, { $set: { isPastDueNotified: true, status: "OverDue" } });
            }
        }

        // Send one-hour-before reminders
        const oneHourBeforeTasks = await Schedule.find({ isOneHourBeforeNotified: false, isCompleted: false });

        for (const task of oneHourBeforeTasks) {
            const taskDueDate = new Date(task.dueDate);
            const [taskHour, taskMinute] = task.timeDue.split(":").map(Number);
            taskDueDate.setHours(taskHour, taskMinute, 0, 0);

            const oneHourBefore = new Date(taskDueDate.getTime() - 60 * 60 * 1000); // Subtract 1 hour

            if (oneHourBefore.getHours() === nowHour && oneHourBefore.getMinutes() === nowMinute) {
                const user = await User.findById(task.userId);
                if (!user) continue;

                console.log(`Sending one-hour-before reminder to ${user.email} for task: ${task.title}`);
                try {
                    await sendOneHourBefore(user.email, task);
                    await Schedule.updateOne({ _id: task._id }, { $set: { isOneHourBeforeNotified: true } });
                } catch (emailError) {
                    console.error(`Failed to send one-hour-before reminder to ${user.email}:`, emailError);
                }
            }
        }

        // Send one-day-before reminders
        const oneDayBeforeTasks = await Schedule.find({
            isOneDayBeforeNotified: false,
            isCompleted: false,
        });

        for (const task of oneDayBeforeTasks) {
            const taskDueDate = new Date(task.dueDate);

            // Compute "one day before" date
            const oneDayBefore = new Date(taskDueDate);
            oneDayBefore.setDate(taskDueDate.getDate() - 1); // Set to one day before
            oneDayBefore.setHours(0, 0, 0, 0); // Set to 12:00 AM

            if (now >= oneDayBefore && now < taskDueDate) {
                // Make sure we are within the correct notification window
                const user = await User.findById(task.userId);
                if (!user) continue;

                console.log(`Sending one-day-before reminder to ${user.email} for task: ${task.title}`);
                await sendOneDayBefore(user.email, task);
                await Schedule.updateOne({ _id: task._id }, { $set: { isOneDayBeforeNotified: true } });
            }
        }
    } catch (err) {
        console.error("Error running cron job:", err);
    }
});
// }

export default cron;
