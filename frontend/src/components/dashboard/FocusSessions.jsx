import { useEffect, useState } from "react";
import axios from "axios";
import { Timer } from "lucide-react";

const endpoint = "/api/schedule/focus";
const durations = [15, 25, 50];
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const button = "rounded-lg border border-[#cadbd2] px-3 py-2 text-sm font-semibold disabled:opacity-50";

export default function FocusSessions({ task }) {
    const [progress, setProgress] = useState(null);
    const [duration, setDuration] = useState(25);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [revision, setRevision] = useState(0);
    const [now, setNow] = useState(Date.now);
    const endsAt = progress?.active?.endsAt;
    const deadline = endsAt ? Date.parse(endsAt) : null;
    const seconds = endsAt ? Math.max(0, Math.ceil((Date.parse(endsAt) - now - progress.offset) / 1000)) : 0;
    const totalMinutes = progress?.days.reduce((total, day) => total + day.minutes, 0);
    const totalSessions = progress?.days.reduce((total, day) => total + day.sessions, 0);

    useEffect(() => {
        if (busy) return;
        const controller = new AbortController();
        let request;
        const refresh = async () => {
            if (request) return;
            request = axios.get(endpoint, { signal: controller.signal, withCredentials: true });
            try {
                const { data } = await request;
                if (controller.signal.aborted) return;
                const receivedAt = Date.now();
                setNow(receivedAt);
                setProgress({ ...data, offset: Date.parse(data.serverTime) - receivedAt });
                setError("");
            } catch {
                if (!controller.signal.aborted) setError("Could not load focus progress.");
            } finally {
                request = null;
            }
        };
        refresh();
        const interval = setInterval(refresh, 30_000);
        window.addEventListener("focus", refresh);
        return () => {
            controller.abort();
            clearInterval(interval);
            window.removeEventListener("focus", refresh);
        };
    }, [revision, busy]);

    useEffect(() => {
        if (!deadline) return;
        const interval = setInterval(() => setNow(Date.now()), 250);
        const expiry = setTimeout(() => setRevision((value) => value + 1),
            Math.max(0, deadline - Date.now() - progress.offset) + 200);
        return () => {
            clearInterval(interval);
            clearTimeout(expiry);
        };
    }, [deadline, progress?.offset]);

    const changeSession = async (cancel) => {
        setBusy(true);
        setError("");
        try {
            if (cancel) {
                await axios.delete(`${endpoint}/${progress.active._id}`, { withCredentials: true });
                setProgress((current) => ({ ...current, active: null }));
            } else {
                const { data } = await axios.post(endpoint, {
                    minutes: duration,
                    ...(task && { taskId: task._id }),
                }, { withCredentials: true });
                const receivedAt = Date.now();
                setNow(receivedAt);
                setProgress((current) => ({ ...current, active: data.active, offset: Date.parse(data.serverTime) - receivedAt }));
            }
        } catch (requestError) {
            if (requestError.response?.status === 409) setRevision((value) => value + 1);
            setError(requestError.response?.data?.message || "Could not update your focus session.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <section aria-labelledby="focus-title" className="rounded-2xl border border-[#dbe6e0] bg-white p-5">
                <h2 id="focus-title" className="flex items-center gap-2 text-lg font-bold text-[#233e35]"><Timer size={20} aria-hidden="true" /> Focus Session</h2>
                {error && <p role="alert" className="mt-2 text-sm text-red-700">
                    {error} <button type="button" className="underline" onClick={() => setRevision((value) => value + 1)}>Refresh</button>
                </p>}
                {!progress && !error && <p role="status" className="mt-3 text-sm">Loading focus session…</p>}
                {progress?.active ? (
                    <div className="mt-3 space-y-2">
                        <p className="break-words text-sm text-gray-700">{progress.active.taskTitle || "Independent study"}</p>
                        <p role="timer" className="text-4xl font-bold tabular-nums text-[#233e35]">
                            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
                        </p>
                        <button type="button" className={button} onClick={() => changeSession(true)} disabled={busy || seconds === 0}>End Early</button>
                    </div>
                ) : progress && (
                    <div className="mt-3">
                        <p className="mb-3 break-words text-sm text-gray-700">{task ? `Focus on ${task.title}` : "Independent study"}</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <label className="text-sm">Duration{" "}
                                <select className={button} value={duration} onChange={(event) => setDuration(Number(event.target.value))} disabled={busy}>
                                    {durations.map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
                                </select>
                            </label>
                            <button type="button" className={button + " bg-[#346557] text-white"} onClick={() => changeSession(false)} disabled={busy}>Start Focus</button>
                        </div>
                    </div>
                )}
            </section>
            <section aria-labelledby="progress-title" className="rounded-2xl border border-[#dbe6e0] bg-white p-5">
                <h2 id="progress-title" className="text-lg font-bold text-[#233e35]">Study Progress</h2>
                {progress && (
                    <>
                        <p className="mt-2 text-sm text-gray-700"><strong>{totalMinutes} min</strong> · {totalSessions} completed {totalSessions === 1 ? "session" : "sessions"} this week</p>
                        <ul aria-label="Focus minutes this week, Manila time" className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
                            {progress.days.map((day, index) => (
                                <li key={day.date} className="min-w-0 rounded-md bg-[#f0f6f2] py-2">
                                    <span className="block text-gray-600">{weekdays[index]}</span>
                                    <span className="font-semibold tabular-nums">{day.minutes}</span><span className="sr-only"> minutes</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </section>
        </div>
    );
}
