export const postTypes = {
    discussion: "Discussion",
    question: "Question",
    resource: "Resource",
    session: "Review session",
};

export const subjectLabel = (subject) => subject?.trim() || "General";
export const subjectKey = (subject) => subjectLabel(subject).toLowerCase();

export function getSubjectSpaces(posts) {
    const subjects = new Map();
    for (const { subject } of posts) {
        const key = subjectKey(subject);
        const space = subjects.get(key);
        if (space) space.count++;
        else subjects.set(key, { key, label: subjectLabel(subject), count: 1 });
    }
    return [...subjects.values()].sort((a, b) => a.label.localeCompare(b.label));
}
