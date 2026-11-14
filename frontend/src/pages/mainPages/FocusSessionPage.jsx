import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FocusTimer from "@/components/focus/FocusTimer.jsx";
import { useFocusSession } from "@/lib/useFocusSession.js";
import { taskIsComplete } from "@/lib/utils/todayTasks.js";
import { useTaskStore } from "@/store/taskStore.js";

export default function FocusSessionPage() {
    const [params] = useSearchParams();
    const [taskId, setTaskId] = useState(() => params.get("task") || "");
    const { tasks, getTasks, isLoading, error } = useTaskStore();
    const available = tasks.filter((task) => !task.isArchived && !task.deletedAt && !taskIsComplete(task));
    const task = available.find((item) => item._id === taskId);
    const session = useFocusSession(task);
    const active = session.progress?.active;
    const nextTopic = task?.topics?.find((topic) => !topic.done);

    useEffect(() => { getTasks(); }, [getTasks]);

    return (
        <div className="mx-auto max-w-5xl py-4">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold tracking-tight">Focus Session</h1>
                <Link to="/study-progress" className="text-sm font-semibold text-[#346557] hover:underline">View Study Progress</Link>
            </header>
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
                <FocusTimer session={session} />
                <section className="min-w-0 rounded-xl border border-[#dbe6e0] bg-white p-5">
                    <h2 className="font-semibold">Study context</h2>
                    {active ? <p className="mt-3 text-sm [overflow-wrap:anywhere]">{active.taskTitle || "Independent study"}</p> : (
                        <>
                            <label className="mt-3 block text-sm text-[#526c62]">What are you studying?
                                <select disabled={session.busy || isLoading} value={task?._id || ""} onChange={(event) => setTaskId(event.target.value)}
                                    className="mt-1 w-full rounded-lg border border-[#dbe6e0] bg-white p-2 text-[#1f3430]">
                                    <option value="">Independent study</option>
                                    {available.map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}
                                </select>
                            </label>
                            {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
                            {nextTopic && <p className="mt-3 rounded-lg bg-[#e7f0ec] p-3 text-sm [overflow-wrap:anywhere]">Next topic: {nextTopic.title}</p>}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
