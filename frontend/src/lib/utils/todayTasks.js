const manilaDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

export const manilaDateKey = (date) => manilaDate.format(date);

export const taskDeadlineMs = (task) => {
    const date = task.dueDate?.slice(0, 10);
    const time = task.timeDue?.padStart(5, "0");
    return Date.parse(`${date}T${time}:00+08:00`);
};

export const taskIsComplete = (task) => task.isCompleted || task.status?.toLowerCase() === "completed";

export const groupTodayTasks = (tasks, now = new Date()) => {
    const today = manilaDateKey(now);
    const groups = { dueToday: [], overdue: [], upcoming: [] };
    const scheduled = [];

    for (const task of tasks) {
        if (task.isArchived || taskIsComplete(task)) continue;

        const date = task.dueDate?.slice(0, 10);
        const deadline = taskDeadlineMs(task);
        if (!Number.isFinite(deadline)) continue;
        scheduled.push({ task, date, deadline });
    }

    scheduled.sort((first, second) => first.deadline - second.deadline);
    for (const entry of scheduled) {
        if (entry.deadline <= now.getTime()) groups.overdue.push(entry);
        else if (entry.date === today) groups.dueToday.push(entry);
        else groups.upcoming.push(entry);
    }
    return groups;
};
