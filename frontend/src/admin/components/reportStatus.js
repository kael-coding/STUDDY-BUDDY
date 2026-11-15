export const reportStatus = {
    pending: { label: "Pending review", color: "#a56417", badge: "bg-amber-50 text-amber-900" },
    removing: { label: "Removal in progress", color: "#9c4539", badge: "bg-orange-50 text-orange-900" },
    dismissed: { label: "Dismissed", color: "#718b80", badge: "bg-[#edf2ef] text-[#425d52]" },
    removed: { label: "Post removed", color: "#346557", badge: "bg-[#e7f0ec] text-[#294f43]" },
};

const date = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" });

export const reportDate = (value) => {
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? date.format(timestamp) : "—";
};

export const reportMetrics = (summary) => ({
    total: Object.keys(reportStatus).reduce((total, key) => total + (summary[key] ?? 0), 0),
    open: (summary.pending ?? 0) + (summary.removing ?? 0),
    removed: summary.removed ?? 0,
    dismissed: summary.dismissed ?? 0,
});
