const manilaDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

export const groupTodayTasks = (tasks, now = new Date()) => {
    const today = manilaDate.format(now);
    const groups = { dueToday: [], overdue: [], upcoming: [] };
    const scheduled = [];

    for (const task of tasks) {
        if (task.isArchived || task.isCompleted || task.status === "completed") continue;

        const date = task.dueDate?.slice(0, 10);
        const time = task.timeDue?.padStart(5, "0");
        const deadline = Date.parse(`${date}T${time}:00+08:00`);
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
