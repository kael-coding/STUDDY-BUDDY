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


    const tasksStartingSoon = await Schedule.find({ startDate: { $lte: oneHourLater, $gt: now } });
    tasksStartingSoon.forEach(async (task) => {
        const user = await User.findById(task.userId);
        if (!user) return;

        await sendTaskStartingSoonReminder(user.email, task);
    });


    const pastDueTasks = await Schedule.find({
        dueDate: { $lt: now },
    });

    pastDueTasks.forEach(async (task) => {
        const user = await User.findById(task.userId);
        if (!user) return;

        const taskTimeDue = task.timeDue.split(':'); // Split the timeDue into hours and minutes
        const taskDueDateTime = new Date(task.dueDate);
        taskDueDateTime.setHours(taskTimeDue[0], taskTimeDue[1], 0, 0);


        if (taskDueDateTime < now) {
            await sendPastDueNotification(user.email, task);
        }
    });


    const tasksDueTomorrow = await Schedule.find({
        dueDate: { $gte: tomorrow, $lt: nextWeek },
    });
    tasksDueTomorrow.forEach(async (task) => {
        const user = await User.findById(task.userId);
        if (!user) return;

        await sendOneDayBefore(user.email, task);
    });


    const tasksDueNextWeek = await Schedule.find({
        dueDate: { $gte: nextWeek, $lt: new Date(nextWeek.getTime() + 24 * 60 * 60 * 1000) },
    });
    tasksDueNextWeek.forEach(async (task) => {
        const user = await User.findById(task.userId);
        if (!user) return;

        await sendOneDayBefore(user.email, task);
    });
});

export default cron;
