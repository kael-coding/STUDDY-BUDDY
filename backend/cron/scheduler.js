import cron from 'node-cron';
import { Schedule } from '../models/schedule.model.js';
import { User } from '../models/user.model.js';
import { sendPastDueNotification, sendTaskStartingSoonReminder, sendOneDayBefore } from '../middleware/nodemailer/email.js';

cron.schedule('* * * * *', async () => {
    console.log("Running cron job for task reminders");

    const nowUTC = new Date();
    const now = new Date(nowUTC.getTime() + 8 * 60 * 60 * 1000);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(0, 0, 0, 0);


    const tasksStartingSoon = await Schedule.find({
        startDate: { $lte: oneHourLater, $gt: now },
        isNotified: false,
    });

    for (const task of tasksStartingSoon) {
        const user = await User.findById(task.userId);
        if (!user) continue;

        await sendTaskStartingSoonReminder(user.email, task);
        await Schedule.updateOne({ _id: task._id }, { $set: { isNotified: true } });
    }


    const pastDueTasks = await Schedule.find({
        dueDate: { $lt: now },
        isPastDueNotified: false,
    });

    for (const task of pastDueTasks) {
        const user = await User.findById(task.userId);
        if (!user) continue;

        await sendPastDueNotification(user.email, task);
        await Schedule.updateOne({ _id: task._id }, { $set: { isPastDueNotified: true } });
    }

    const tasksDueTomorrow = await Schedule.find({
        dueDate: { $gte: tomorrow, $lt: nextWeek },
        isOneDayBeforeNotified: false,
    });

    for (const task of tasksDueTomorrow) {
        const user = await User.findById(task.userId);
        if (!user) continue;

        await sendOneDayBefore(user.email, task);
        await Schedule.updateOne({ _id: task._id }, { $set: { isOneDayBeforeNotified: true } });
    }
});

export default cron;
