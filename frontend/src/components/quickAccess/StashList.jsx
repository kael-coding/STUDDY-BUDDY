import { useState } from "react";
import { Archive, CalendarDays, FileText, RotateCcw, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import ViewFilters from "./ViewFilters.jsx";
import { taskDeadlineMs, taskIsComplete } from "@/lib/utils/todayTasks.js";

const dateFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" });
const button = "inline-flex items-center gap-1.5 rounded-lg border border-[#cbd9d1] px-3 py-1.5 text-sm font-semibold text-[#346557] hover:bg-[#e7f0ec] disabled:opacity-50";

export default function StashList({ trash, items, loading, error, onRetry, busy, onRestore, onRestoreToArchive, onMoveToTrash }) {
    const [type, setType] = useState("notes");
    const [status, setStatus] = useState("all");
    const title = trash ? "Trash" : "Archive";
    const label = type === "tasks" ? "assessments" : "notes";
    const Icon = type === "tasks" ? CalendarDays : FileText;
    const EmptyIcon = trash ? Trash2 : Archive;
    const rows = (items?.[type] ?? []).filter((item) => {
        if (trash || type === "notes" || status === "all") return true;
        return status === "complete" ? taskIsComplete(item) : !taskIsComplete(item) && taskDeadlineMs(item) <= Date.now();
    });

    return (
        <section className="max-w-3xl space-y-5 py-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="mt-1 text-sm text-[#526c62]">{trash ? "Restore deleted items to your active list or Archive." : "Notes and assessments you’ve set aside."}</p>
                </div>
                <Link to={trash ? "/archive" : "/trash"} className={button}>{trash ? "Open Archive" : "Open Trash"}</Link>
            </header>
            <div className="flex flex-wrap items-center gap-3">
                <ViewFilters label="Item type" options={[["notes", "Notes"], ["tasks", "Assessments"]]} value={type} onChange={setType} />
                {!trash && type === "tasks" && (
                    <select aria-label="Assessment status" value={status} onChange={(event) => setStatus(event.target.value)}
                        className="rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-sm">
                        <option value="all">All statuses</option><option value="complete">Completed</option><option value="overdue">Overdue</option>
                    </select>
                )}
            </div>
            {loading && <p role="status" className="text-sm text-[#526c62]">Loading {title.toLowerCase()}…</p>}
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error} <button type="button" onClick={onRetry} className="underline">Retry</button></p>}
            {!error && (!loading || rows.length > 0) && (
                <div className="rounded-xl border border-[#dce7e1] bg-white">
                    {rows.length ? (
                        <ul className="divide-y divide-[#dce7e1]">
                            {rows.map((item) => {
                                const date = Date.parse(trash ? item.deletedAt : type === "tasks" ? item.dueDate?.slice(0, 10) : item.updatedAt);
                                const dateLabel = trash ? "Deleted" : type === "tasks" ? "Deadline" : "Updated";
                                return (
                                    <li key={item._id} className="flex flex-wrap items-start gap-3 p-4">
                                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e7f0ec] text-[#346557]"><Icon size={17} aria-hidden="true" /></span>
                                        <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                                            {trash ? <p className="text-sm font-semibold">{item.title}</p> : (
                                                <details>
                                                    <summary className="cursor-pointer text-sm font-semibold">{item.title}</summary>
                                                    {type === "tasks" && <p className="mt-1 text-xs text-[#526c62]">
                                                        {[item.status, item.priority, item.startDate && `Starts ${item.startDate.slice(0, 10)}`, item.timeDue && `Due at ${item.timeDue}`].filter(Boolean).join(" · ")}
                                                    </p>}
                                                    {item.description && <p className="mt-1 whitespace-pre-wrap text-sm">{item.description}</p>}
                                                </details>
                                            )}
                                            <p className="mt-1 text-xs text-[#526c62]">{[item.subject, Number.isFinite(date) && `${dateLabel} ${dateFormat.format(date)}`].filter(Boolean).join(" · ")}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" className={button} disabled={busy !== null} onClick={() => onRestore(type, item)}>
                                                <RotateCcw size={15} aria-hidden="true" /> {busy === item._id ? "Moving…" : trash ? "Restore" : "Unarchive"}
                                            </button>
                                            {trash ? (
                                                <button type="button" disabled={busy !== null} className={button} onClick={() => onRestoreToArchive(type, item)}>Restore to Archive</button>
                                            ) : (
                                                <button type="button" disabled={busy !== null} className={button + " !text-red-700"} onClick={() => onMoveToTrash(type, item)}>Move to Trash</button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="p-8 text-center">
                            <EmptyIcon size={24} className="mx-auto mb-2 text-[#346557]" aria-hidden="true" />
                            <p className="text-sm font-semibold">No {label} in this view</p>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
