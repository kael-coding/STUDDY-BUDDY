export const achievements = [
    { id: "first-finish", name: "First Finish", metric: "assessments", target: 1, goal: "Complete your first assessment." },
    { id: "planner-pro", name: "Planner Pro", metric: "assessments", target: 10, goal: "Complete 10 assessments." },
    { id: "notebook-builder", name: "Notebook Builder", metric: "notes", target: 5, goal: "Create 5 study notes." },
    { id: "card-maker", name: "Card Maker", metric: "flashcards", target: 10, goal: "Create 10 flashcards in Study Library." },
    { id: "focus-hour", name: "Focus Hour", metric: "minutes", target: 60, goal: "Complete 60 minutes of focus sessions." },
    { id: "study-streak", name: "Study Streak", metric: "streak", target: 3, goal: "Complete focus sessions on 3 consecutive days." },
    { id: "group-founder", name: "Group Founder", metric: "groups", target: 1, goal: "Create your first Study Group." },
];

export function longestStudyStreak(sortedDays) {
    let previous = null;
    let current = 0;
    let longest = 0;
    for (const day of sortedDays) {
        const timestamp = Date.parse(day + "T00:00:00Z");
        current = previous !== null && timestamp - previous === 86_400_000 ? current + 1 : 1;
        longest = Math.max(longest, current);
        previous = timestamp;
    }
    return longest;
}
