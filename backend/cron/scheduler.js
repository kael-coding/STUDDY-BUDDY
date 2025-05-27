import cron from "node-cron";
import Schedule from "../models/schedule.model.js";
import User from "../models/user.model.js";
import {
    sendPastDueNotification,
    sendOneDayBefore,
    sendOneHourBefore,
} from "../middleware/nodemailer/email.js";
import Notification from "../models/notification.model.js";

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


                const notification = new Notification({
                    userId: user,
                    taskId: task._id,
                    type: 'overDue',
                    text: `Your task ${task.title}`,
                    context: `is past due and has been marked as OverDue.`,
                });

                await notification.save();
            }
        }

        // Send one-hour-before reminders
        const oneHourBeforeTasks = await Schedule.find({ isOneHourBeforeNotified: false, isCompleted: false });

        for (const task of oneHourBeforeTasks) {
            const taskDueDate = new Date(task.dueDate);
            const [taskHour, taskMinute] = task.timeDue.split(":").map(Number);
            taskDueDate.setHours(taskHour, taskMinute, 0, 0);

            const oneHourBefore = new Date(taskDueDate.getTime() - 60 * 60 * 1000); // Subtract 1 hour to get one hour before

            if (oneHourBefore.getHours() === nowHour && oneHourBefore.getMinutes() === nowMinute) {
                const user = await User.findById(task.userId);
                if (!user) continue;

                console.log(`Sending one-hour-before reminder to ${user.email} for task: ${task.title}`);
                try {
                    await sendOneHourBefore(user.email, task);
                    await Schedule.updateOne({ _id: task._id }, { $set: { isOneHourBeforeNotified: true } });

                    const notification = new Notification({
                        userId: user,
                        from: task._id,
                        type: 'reminder',
                        text: `Your task ${task.title}`,
                        context: `is one hour before due`
                    });

                    await notification.save();
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

            const oneDayBefore = new Date(taskDueDate);
            oneDayBefore.setDate(taskDueDate.getDate() - 1);
            oneDayBefore.setHours(0, 0, 0, 0);

            if (now >= oneDayBefore && now < taskDueDate) {

                const user = await User.findById(task.userId);
                if (!user) continue;

                console.log(`Sending one-day-before reminder to ${user.email} for task: ${task.title}`);
                await sendOneDayBefore(user.email, task);
                await Schedule.updateOne({ _id: task._id }, { $set: { isOneDayBeforeNotified: true } });

                const notification = new Notification({
                    userId: user,
                    from: task._id,
                    type: 'reminder',
                    text: `Your task ${task.title}`,
                    context: `is one day before due`
                });

                await notification.save();
            }
        }
    } catch (err) {
        console.error("Error running cron job:", err);
    }
});


export default cron;
