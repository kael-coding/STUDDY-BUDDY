export const validSubject = (subject) =>
    subject === undefined || (typeof subject === "string" && subject.trim().length <= 60);
