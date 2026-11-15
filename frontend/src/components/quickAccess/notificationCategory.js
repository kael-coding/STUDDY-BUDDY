const taskTypes = new Set(["overDue", "completed", "reminder", "taskReminder"]);

export function categoryFor(item) {
    if (item.type === "reportDismissed" || item.type === "reportRemoved") return "reports";
    return item.taskId || taskTypes.has(item.type) ? "tasks" : "community";
}
