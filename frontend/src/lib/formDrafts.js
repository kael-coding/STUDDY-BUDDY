export function draftKey(accountId, form, id) {
    return `study-buddy:draft:v1:${JSON.stringify([accountId, form, id])}`;
}

export function readDraft(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value && typeof value === "object" && !Array.isArray(value) ? value : null;
    } catch {
        return null;
    }
}

export function applyDraft(defaults, draft) {
    return Object.fromEntries(Object.entries(defaults).map(([field, value]) => {
        const saved = draft?.[field];
        return [field, typeof saved === "string" ? saved : value];
    }));
}

export function draftChanges(values, defaults) {
    const changes = Object.fromEntries(Object.entries(values).filter(([field, value]) => value !== defaults[field]));
    return Object.keys(changes).length ? changes : null;
}

export function saveDraft(key, values, defaults) {
    const changes = draftChanges(values, defaults);
    try {
        if (changes === null) {
            localStorage.removeItem(key);
            return null;
        }
        localStorage.setItem(key, JSON.stringify(changes));
        return "saved";
    } catch {
        return "unavailable";
    }
}

export function discardDraft(key, submittedDraft) {
    try {
        if (submittedDraft === undefined || JSON.stringify(readDraft(key)) === JSON.stringify(submittedDraft)) {
            localStorage.removeItem(key);
        }
        return true;
    } catch {
        return false;
    }
}
