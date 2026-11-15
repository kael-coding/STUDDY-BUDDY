import { Archive, CalendarDays, ClipboardList, Trash2, X } from "lucide-react";
import DraftStatus from "@/components/DraftStatus.jsx";
import StudyDialog from "@/components/StudyDialog.jsx";

const field = "mt-1 block w-full min-w-0 rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-sm focus:border-[#346557] focus:outline-none focus:ring-1 focus:ring-[#346557] disabled:bg-[#f0f4f2] [color-scheme:light]";
const secondary = "inline-flex items-center gap-1.5 rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#e7f0ec] disabled:opacity-50";

export default function TaskEditorDialog({
    form, editing, busy, saving, onChange, onSave, onClose, onArchive, onTrash, noteOptions, notesError, draftStatus, onDiscard,
}) {
    const completed = form.status === "completed";
    const title = editing ? "Edit Task" : "New Task";

    return (
        <StudyDialog onClose={onClose} busy={busy} className="w-[min(42rem,calc(100%-1.5rem))]">
            {(titleId) => (
                <form onSubmit={onSave} className="flex max-h-[calc(100dvh-1.5rem)] flex-col">
                    <header className="flex shrink-0 items-center gap-3 border-b border-[#dce7e1] px-4 py-3 sm:px-6 sm:py-4">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f0ec] text-[#346557]"><ClipboardList size={20} aria-hidden="true" /></span>
                        <div className="min-w-0 flex-1">
                            <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
                            <p className="text-xs text-[#526c62]">{completed ? "Completed task" : "Study Planner"}</p>
                        </div>
                        <button type="button" onClick={onClose} disabled={busy} aria-label="Close task form"
                            className="rounded-lg p-2 text-[#526c62] hover:bg-[#e7f0ec] disabled:opacity-50"><X size={19} aria-hidden="true" /></button>
                    </header>
                    <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
                        <fieldset disabled={busy || completed} className="min-w-0 space-y-4">
                            <label className="block text-sm font-medium">Task title
                                <input autoFocus name="title" value={form.title} required onChange={onChange} className={field} placeholder="e.g. Biology quiz" />
                            </label>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <label className="min-w-0 text-sm font-medium">Assessment type
                                    <select name="assessmentType" value={form.assessmentType} onChange={onChange} className={field}>
                                        <option value="task">Task</option><option value="quiz">Quiz</option><option value="exam">Exam</option><option value="assignment">Assignment</option>
                                    </select>
                                </label>
                                <label className="min-w-0 text-sm font-medium">Priority
                                    <select name="priority" value={form.priority} onChange={onChange} className={field}>
                                        <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                                    </select>
                                </label>
                                <label className="min-w-0 text-sm font-medium">Subject <span className="text-xs font-normal text-[#526c62]">Optional</span>
                                    <input name="subject" value={form.subject} maxLength={60} onChange={onChange} className={field} />
                                </label>
                            </div>
                            <section aria-label="Schedule" className="rounded-xl border border-[#dce7e1] bg-[#f8faf9] p-3">
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><CalendarDays size={16} className="text-[#346557]" aria-hidden="true" /> Schedule <span className="text-xs font-normal text-[#526c62]">Manila time</span></h3>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <label className="min-w-0 text-sm font-medium">Start date
                                        <input type="date" name="startDate" value={form.startDate} required onChange={onChange} className={field} />
                                    </label>
                                    <label className="min-w-0 text-sm font-medium">Due date
                                        <input type="date" name="dueDate" value={form.dueDate} required onChange={onChange} className={field} />
                                    </label>
                                    <label className="min-w-0 text-sm font-medium">Due time
                                        <input type="time" name="timeDue" value={form.timeDue} onChange={onChange} className={field} />
                                    </label>
                                </div>
                            </section>
                            <label className="block text-sm font-medium">Task details
                                <textarea name="description" rows={3} value={form.description} required onChange={onChange} className={field + " resize-y"} />
                            </label>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="min-w-0 text-sm font-medium">Linked note <span className="text-xs font-normal text-[#526c62]">Optional</span>
                                    <select name="noteId" value={form.noteId} onChange={onChange} className={field}>
                                        <option value="">No linked note</option>
                                        {form.noteId && !noteOptions.some((note) => note._id === form.noteId) && <option value={form.noteId}>Current linked note</option>}
                                        {noteOptions.map((note) => <option key={note._id} value={note._id}>{note.title}{note.subject && ` · ${note.subject}`}</option>)}
                                    </select>
                                </label>
                                <label className="min-w-0 text-sm font-medium">Checklist <span className="text-xs font-normal text-[#526c62]">One topic per line</span>
                                    <textarea name="topics" rows={3} value={form.topics} onChange={onChange} className={field + " resize-y"} />
                                </label>
                            </div>
                        </fieldset>
                        {notesError && <p role="alert" className="mt-3 text-sm text-red-700">Could not load notes.</p>}
                    </div>
                    <footer className="shrink-0 space-y-2 border-t border-[#dce7e1] bg-[#f8faf9] px-4 py-3 sm:px-6">
                        <DraftStatus status={draftStatus} disabled={busy} onDiscard={onDiscard} />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-2">
                                {editing && <>
                                    <button type="button" className={secondary} onClick={onArchive} disabled={busy}><Archive size={15} aria-hidden="true" /> Archive</button>
                                    <button type="button" className={secondary + " text-red-700 hover:bg-red-50"} onClick={onTrash} disabled={busy}><Trash2 size={15} aria-hidden="true" /> Move to Trash</button>
                                </>}
                            </div>
                            <div className="ml-auto flex flex-wrap gap-2">
                                <button type="button" className={secondary} onClick={onClose} disabled={busy}>Close</button>
                                {!completed && <button type="submit" disabled={busy} className="rounded-lg bg-[#346557] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294f43] disabled:opacity-50">
                                    {saving ? "Saving…" : editing ? "Update Task" : "Create Task"}
                                </button>}
                            </div>
                        </div>
                    </footer>
                </form>
            )}
        </StudyDialog>
    );
}
