const subjectKey = (subject) => subject?.trim().toLowerCase() || "";

export const filterBySubject = (items, subject) =>
    subject === "" ? items : items.filter((item) => subjectKey(item.subject) === subject);

export default function SubjectFilter({ items, value, onChange }) {
    const subjects = new Map(items.filter((item) => subjectKey(item.subject))
        .map((item) => [subjectKey(item.subject), item.subject]));
    if (value && !subjects.has(value)) subjects.set(value, value);

    return (
        <label className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-700">
            Filter by subject
            <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded border border-gray-300 bg-white px-3 py-2">
                <option value="">All subjects</option>
                {Array.from(subjects).sort((a, b) => a[1].localeCompare(b[1])).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                ))}
            </select>
        </label>
    );
}
