import { useEffect, useState, useCallback } from "react";
import { useTaskStore } from "@/store/taskStore";
import { toast } from "react-hot-toast";
import { BookOpen, Check, Plus, Search } from "lucide-react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import SubjectFilter, { filterBySubject } from "@/components/SubjectFilter.jsx";
import LinkedNote from "@/components/LinkedNote.jsx";
import { useArchieveStore } from "@/store/archieveStore.js";
import { groupTodayTasks, taskDeadlineMs, taskIsComplete } from "@/lib/utils/todayTasks.js";
import ConfirmStudyAction from "@/components/ConfirmStudyAction.jsx";
import TaskEditorDialog from "@/components/planner/TaskEditorDialog.jsx";
import { useAuthStore } from "@/store/authStore.js";
import { applyDraft, discardDraft, draftChanges, draftKey, readDraft, saveDraft } from "@/lib/formDrafts.js";

const emptyTask = {
    title: "", startDate: "", dueDate: "", timeDue: "", description: "",
    status: "pending", priority: "Medium", subject: "", noteId: "", assessmentType: "task", topics: "",
};

const formatDate = (date) => {
    const timestamp = Date.parse(date);
    return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : "";
};

function taskFormValues(task) {
    if (!task) return emptyTask;
    const priority = task.priority || "medium";
    return {
        title: task.title || "",
        startDate: formatDate(task.startDate),
        dueDate: formatDate(task.dueDate),
        timeDue: task.timeDue || "",
        description: task.description || "",
        status: taskIsComplete(task) ? "completed" : task.status?.toLowerCase() || "pending",
        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
        subject: task.subject || "",
        noteId: task.noteId || "",
        assessmentType: task.assessmentType || "task",
        topics: (task.topics || []).map((topic) => topic.title).join("\n"),
    };
}

const TaskScheduler = () => {
    const { tasks = [], getTasks, createTask, updateTask, deleteTask, updateTopic } = useTaskStore();
    const [params] = useSearchParams();
    const focusedTask = params.get("task");
    const focusedTopic = params.get("topic");
    const [savingTopic, setSavingTopic] = useState(null);
    const setTaskArchived = useArchieveStore((state) => state.setTaskArchived);
    const [movingTask, setMovingTask] = useState(false);
    const [subjectFilter, setSubjectFilter] = useState("");
    const [noteOptions, setNoteOptions] = useState([]);
    const [notesError, setNotesError] = useState(false);
    const [viewingNote, setViewingNote] = useState(null);
    const [query, setQuery] = useState("");
    const [now, setNow] = useState(() => new Date());
    const [completing, setCompleting] = useState(null);
    const loadingTasks = useTaskStore((state) => state.isLoading);
    const tasksError = useTaskStore((state) => state.error);
    const search = query.trim().toLowerCase();
    const visibleTasks = filterBySubject(tasks, subjectFilter).filter((task) =>
        [task.title, task.subject, task.description].some((value) => value?.toLowerCase().includes(search)),
    );
    const groups = groupTodayTasks(visibleTasks, now);
    const done = visibleTasks.filter(taskIsComplete).sort((a, b) =>
        Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt),
    );
    const unscheduled = visibleTasks.filter((task) => !taskIsComplete(task) && !Number.isFinite(taskDeadlineMs(task)));
    const sections = [
        ["Overdue", groups.overdue.map(({ task }) => task), "text-red-700"],
        ["Today", groups.dueToday.map(({ task }) => task), "text-[#346557]"],
        ["Upcoming", groups.upcoming.map(({ task }) => task), "text-slate-700"],
        ["Done", done, "text-[#346557]"],
    ];
    if (unscheduled.length) sections.push(["Check deadline", unscheduled, "text-amber-800"]);

    const [isLoading, setIsLoading] = useState(true);
    const accountId = useAuthStore((state) => state.user?._id);
    const [form, setForm] = useState(emptyTask);
    const [baseline, setBaseline] = useState(emptyTask);
    const [draftStatus, setDraftStatus] = useState(null);
    const [savingTask, setSavingTask] = useState(false);

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const key = draftKey(accountId, "planner-task", editingTaskId);
    const [pendingAction, setPendingAction] = useState(null);

    const fetchTasks = useCallback(async () => {
        await getTasks();
        setNow(new Date());
        setIsLoading(false);
    }, [getTasks]);

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 30000);
        return () => clearInterval(interval);
    }, [fetchTasks]);

    useEffect(() => {
        if (!isPopupOpen) return;
        const controller = new AbortController();
        setNotesError(false);
        setNoteOptions([]);
        axios.get("/api/notes/get-notes?showArchived=true", {
            withCredentials: true,
            signal: controller.signal,
        }).then(({ data }) => setNoteOptions(data.notes)).catch(() => {
            if (!controller.signal.aborted) setNotesError(true);
        });
        return () => controller.abort();
    }, [isPopupOpen]);

    const openPopup = (task = null) => {
        const id = task?._id ?? null;
        const defaults = taskFormValues(task);
        const draft = defaults.status === "completed" ? null : readDraft(draftKey(accountId, "planner-task", id));
        setBaseline(defaults);
        setForm({ ...applyDraft(defaults, draft), status: defaults.status });
        setDraftStatus(draft ? "saved" : null);
        setEditingTaskId(id);
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setEditingTaskId(null);
    };

    const handleChange = (e) => {
        const next = { ...form, [e.target.name]: e.target.value };
        setForm(next);
        setDraftStatus(saveDraft(key, next, baseline));
    };

    const resetDraft = () => {
        if (!discardDraft(key)) { setDraftStatus("unavailable"); return; }
        setForm(baseline);
        setDraftStatus(null);
    };

    const validateForm = () => {
        if (!form.title.trim() || !form.description.trim() || !form.startDate || !form.dueDate) {
            toast.error("Enter a title, task details, start date, and due date.");
            return false;
        }
        if (new Date(form.startDate) > new Date(form.dueDate)) {
            toast.error("Start date cannot be after the Due Date!");
            return false;
        }
        return true;
    };

    const saveTask = async (event) => {
        event.preventDefault();
        if (savingTask || !validateForm()) return;

        setSavingTask(true);
        const submittedDraft = draftChanges(form, baseline);

        const formattedTask = {
            title: form.title,
            description: form.description,
            startDate: form.startDate,
            dueDate: form.dueDate,
            timeDue: form.timeDue || "00:00",
            priority: form.priority.toLowerCase(),
            subject: form.subject,
            noteId: form.noteId || null,
            assessmentType: form.assessmentType,
            topics: form.topics.split("\n").map((line) => line.trim()).filter(Boolean),
        };

        try {
            if (editingTaskId) {
                const existing = tasks.find((task) => task._id === editingTaskId);
                if (form.topics === (existing?.topics || []).map((topic) => topic.title).join("\n")) {
                    delete formattedTask.topics;
                }
                if (!await updateTask(editingTaskId, formattedTask)) throw new Error("Update failed");
                toast.success("Task updated successfully!");
            } else {
                if (!await createTask(formattedTask)) throw new Error("Create failed");
                toast.success("Task created successfully!");
            }
            if (!discardDraft(key, submittedDraft)) toast.error("Task saved, but its draft could not be cleared.");
            closePopup();
            fetchTasks();
        } catch {
            toast.error(useTaskStore.getState().error || "Could not save the task.");
        } finally {
            setSavingTask(false);
        }
    };

    const getPriorityStyles = (priority) => {
        const lower = priority.toLowerCase();
        return lower === "low"
            ? "bg-green-100 text-green-700"
            : lower === "medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700";
    };

    const changeCompletion = async (task) => {
        const reopening = taskIsComplete(task);
        setCompleting(task._id);
        try {
            const updated = await updateTask(task._id, reopening
                ? { status: "Pending", isCompleted: false }
                : { status: "completed" });
            if (updated) toast.success(reopening ? "Task reopened." : "Task marked as done.");
            else toast.error("Could not update the task. Try again.");
        } finally {
            setCompleting(null);
        }
    };

    const moveTask = async () => {
        const trash = pendingAction === "trash";
        setMovingTask(true);
        try {
            if (trash) {
                if (!await deleteTask(editingTaskId)) throw new Error(useTaskStore.getState().error || "Could not move the task to Trash.");
                discardDraft(key);
            } else {
                await setTaskArchived(editingTaskId, true);
            }
            closePopup();
            toast.success(trash ? "Task moved to Trash." : "Task moved to Archive.");
            await fetchTasks();
        } finally {
            setMovingTask(false);
        }
    };

    const hasTarget = tasks.some((task) => task._id === focusedTask);
    useEffect(() => {
        if (!hasTarget) return;
        const target = document.getElementById(`topic-${focusedTopic}`) || document.getElementById(`assessment-${focusedTask}`);
        target?.scrollIntoView({ block: "nearest" });
    }, [focusedTask, focusedTopic, hasTarget]);

    const toggleTopic = async (task, topic) => {
        setSavingTopic(topic._id);
        try {
            await updateTopic(task._id, topic._id, !topic.done);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not update the checklist.");
        } finally {
            setSavingTopic(null);
        }
    };

    return (
        <div className="mx-auto max-w-5xl px-1 py-4 sm:px-5 sm:py-6">
            <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-[#233e35]">Study Planner</h1>
                <button type="button" onClick={() => openPopup()} className="inline-flex items-center gap-2 rounded-lg bg-[#346557] px-4 py-2.5 font-semibold text-white hover:bg-[#284f44]">
                    <Plus size={18} aria-hidden="true" /> New Task
                </button>
            </header>
            <div className="mb-5 flex flex-wrap items-end gap-3">
                <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#cbd9d1] bg-white px-3 py-2">
                    <Search size={17} aria-hidden="true" />
                    <input type="search" aria-label="Search tasks" placeholder="Search tasks" value={query}
                        onChange={(event) => setQuery(event.target.value)} className="w-full min-w-0 text-sm" />
                </label>
                <SubjectFilter items={tasks} value={subjectFilter} onChange={setSubjectFilter} />
            </div>
            {viewingNote && <LinkedNote noteId={viewingNote} onClose={() => setViewingNote(null)} />}
            {tasksError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{tasksError}</p>}
            {loadingTasks && tasks.length === 0 && <p role="status">Loading tasks…</p>}
            {!loadingTasks && !tasksError && visibleTasks.length === 0 && (
                <p className="rounded-xl border border-[#dbe6e0] bg-white p-5 text-sm text-gray-600">
                    {search || subjectFilter ? "No tasks match your filters." : "No tasks yet. Add a task to start planning."}
                </p>
            )}
            <div className="space-y-4">
                {sections.filter(([, items]) => items.length > 0).map(([title, items, color]) => (
                    <section key={title} className="rounded-xl border border-[#dbe6e0] bg-white">
                        <h2 className={"border-b border-[#edf2ef] px-4 py-3 font-semibold " + color}>{title} <span className="ml-1 text-sm font-normal">({items.length})</span></h2>
                        <ul className="divide-y divide-[#edf2ef]">
                            {items.map((task) => (
                                <li key={task._id} id={`assessment-${task._id}`} className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${focusedTask === task._id ? "bg-[#eff5f1]" : ""}`}>
                                    <div className="min-w-0 flex-1">
                                        <button type="button" onClick={() => openPopup(task)}
                                            className="break-words text-left font-semibold text-[#233e35] hover:underline">
                                            {task.title}
                                        </button>
                                        <p className="mt-1 break-words text-sm text-gray-600">
                                            {[task.assessmentType === "task" ? null : task.assessmentType, task.subject, task.dueDate?.slice(0, 10), task.timeDue].filter(Boolean).join(" · ")}
                                        </p>
                                    </div>
                                    <span className={"rounded px-2 py-1 text-xs font-medium capitalize " + getPriorityStyles(task.priority || "low")}>{task.priority || "low"}</span>
                                    {task.noteId && (
                                        <button type="button" onClick={() => setViewingNote(task.noteId)} className="inline-flex items-center gap-1 rounded border border-[#cbd9d1] px-2 py-1.5 text-sm text-[#346557]">
                                            <BookOpen size={15} aria-hidden="true" /> Note
                                        </button>
                                    )}
                                    <button type="button" aria-label={taskIsComplete(task) ? `Reopen ${task.title}` : `Mark ${task.title} as done`}
                                        disabled={completing !== null || isLoading || movingTask} onClick={() => changeCompletion(task)}
                                        className="inline-flex items-center gap-1 rounded bg-[#e5f1eb] px-2 py-1.5 text-sm font-semibold text-[#295547] hover:bg-[#d3e8dd] disabled:opacity-50">
                                        {!taskIsComplete(task) && <Check size={15} aria-hidden="true" />}
                                        {completing === task._id ? "Saving…" : taskIsComplete(task) ? "Reopen" : "Done"}
                                    </button>
                                    {!!task.topics?.length && (
                                        <details open={focusedTask === task._id || undefined} className="w-full rounded-lg bg-[#f4f7f5] px-3 py-2">
                                            <summary className="cursor-pointer text-sm font-medium">Checklist · {task.topics.filter((topic) => topic.done).length}/{task.topics.length} complete</summary>
                                            <ul className="mt-2 space-y-1">
                                                {task.topics.map((topic) => (
                                                    <li key={topic._id} id={`topic-${topic._id}`} className={focusedTopic === topic._id ? "rounded bg-[#dbece3] px-2 py-1" : ""}>
                                                        <label className="flex items-start gap-2 text-sm">
                                                            <input type="checkbox" checked={topic.done} disabled={savingTopic !== null} onChange={() => toggleTopic(task, topic)} className="mt-1 accent-[#346557]" />
                                                            <span className={topic.done ? "line-through" : ""}>{topic.title}</span>
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>

            {isPopupOpen && <TaskEditorDialog form={form} editing={Boolean(editingTaskId)} busy={savingTask || movingTask}
                saving={savingTask} onChange={handleChange} onSave={saveTask} onClose={closePopup}
                onArchive={() => setPendingAction("archive")} onTrash={() => setPendingAction("trash")}
                noteOptions={noteOptions} notesError={notesError} draftStatus={draftStatus} onDiscard={resetDraft} />}
            {pendingAction && <ConfirmStudyAction action={pendingAction} itemTitle={baseline.title}
                onConfirm={moveTask} onClose={() => setPendingAction(null)} />}
        </div>
    );
};

export default TaskScheduler;
