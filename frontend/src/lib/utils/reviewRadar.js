import { manilaDateKey, taskDeadlineMs, taskIsComplete } from "./todayTasks.js";

const dayMs = 86_400_000;
const subjectKey = (subject) => subject?.trim().toLowerCase() || "";

export function buildReviewRadar(tasks, notes, now = new Date()) {
    const today = Date.parse(manilaDateKey(now) + "T00:00:00+08:00");
    const cutoff = today + 7 * dayMs;
    const decks = notes
        .filter((note) => !note.isArchived && !note.deletedAt)
        .map((note) => ({ note, count: note.flashcards?.filter((card) => card.reviewAgain).length || 0 }))
        .filter(({ count }) => count > 0);
    const assessments = [];

    for (const task of tasks) {
        if (task.isArchived || task.deletedAt || taskIsComplete(task)) continue;
        const deadline = taskDeadlineMs(task);
        if (!Number.isFinite(deadline) || deadline >= cutoff) continue;

        const topics = (task.topics || []).filter((topic) => !topic.done);
        const subject = subjectKey(task.subject);
        const related = decks.filter(({ note }) => note._id === task.noteId || (subject && subjectKey(note.subject) === subject));
        related.sort((a, b) => Number(b.note._id === task.noteId) - Number(a.note._id === task.noteId) || b.count - a.count);
        if (topics.length || related.length) assessments.push({ task, deadline, topics, related });
    }

    assessments.sort((a, b) => a.deadline - b.deadline);
    const assigned = new Set(assessments.flatMap(({ related }) => related.map(({ note }) => note._id)));
    const otherDecks = decks.filter(({ note }) => !assigned.has(note._id)).sort((a, b) => b.count - a.count);
    return { assessments, otherDecks };
}
