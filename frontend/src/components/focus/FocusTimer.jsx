import { Coffee, Pause, Play, RotateCcw, Timer } from "lucide-react";
import TimerFace from "./TimerFace.jsx";
import { maxBreaks, restMinutes } from "@/lib/useFocusSession.js";

const durations = [15, 25, 50];
const button = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50";

export default function FocusTimer({ session }) {
    const {
        progress, duration, setDuration, busy, error, seconds, paused, resting, breakSeconds,
        changeSession, refresh, reset, completedSession,
    } = session;
    const active = progress?.active;
    const focusMinutes = active?.minutes ?? duration;
    const remaining = resting ? breakSeconds : active ? seconds : duration * 60;
    const breaksLeft = maxBreaks - (active?.breaksUsed ?? 0);
    const canAdjust = Boolean(active) && seconds > 0;

    let status = progress ? "Ready" : error ? "Unavailable" : "Loading…";
    if (active) status = seconds > 0 ? "Focusing" : "Finishing session…";
    if (paused) status = "Paused";
    if (resting) status = "On break";

    const primaryAction = active ? paused || resting ? "resume" : "pause" : "start";
    const primaryLabel = { start: "Start Focus", pause: "Pause Focus", resume: "Resume Focus" }[primaryAction];
    const PrimaryIcon = primaryAction === "pause" ? Pause : Play;

    return (
        <section aria-label="Focus and rest timer" className="rounded-xl border border-[#dbe6e0] bg-white p-5 text-center sm:p-8">
            <div role="group" className="flex flex-wrap justify-center gap-2" aria-label="Focus duration">
                {durations.map((value) => (
                    <button key={value} type="button" disabled={busy || Boolean(active)} aria-pressed={focusMinutes === value}
                        onClick={() => setDuration(value)} className={button + (focusMinutes === value ? " bg-[#e7f0ec] text-[#346557]" : " border border-[#dbe6e0]")}>
                        {value} min
                    </button>
                ))}
            </div>
            <TimerFace remaining={remaining} total={(resting ? restMinutes : focusMinutes) * 60} status={status} resting={resting} />
            {error && <p role="alert" className="mb-4 text-sm text-red-700">{error} <button type="button" onClick={refresh} className="underline">Retry</button></p>}
            {!active && completedSession && <p role="status" className="mb-4 font-semibold text-[#346557]">Session complete · {completedSession.minutes} minutes saved</p>}
            <div className="flex flex-wrap justify-center gap-2">
                <button type="button" disabled={busy || !progress || (Boolean(active) && !canAdjust)}
                    onClick={() => changeSession(primaryAction)} className={button + " bg-[#346557] text-white hover:bg-[#294f43]"}>
                    <PrimaryIcon size={16} aria-hidden="true" /> {primaryLabel}
                </button>
                <button type="button" disabled={busy || (active ? !canAdjust : !completedSession)} onClick={reset}
                    className={button + " border border-[#dbe6e0] hover:bg-[#f8faf9]"}>
                    <RotateCcw size={16} aria-hidden="true" /> Reset
                </button>
                <button type="button" disabled={busy || !canAdjust || resting || breaksLeft <= 0} onClick={() => changeSession("break")}
                    className={button + " border border-[#e5d9c8] text-[#704d2b] hover:bg-[#f4eadf]"}>
                    <Coffee size={16} aria-hidden="true" /> {restMinutes}-Min Rest
                </button>
            </div>
            {active && <p className="mt-4 text-xs text-[#526c62]" aria-live="polite">
                {breaksLeft} of {maxBreaks} breaks left{resting ? " · Focus resumes automatically" : ""}
            </p>}
            {!active && <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#526c62]">
                <Timer size={15} className="shrink-0" aria-hidden="true" /> Your session is saved if you refresh or leave this page.
            </p>}
        </section>
    );
}
