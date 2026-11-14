import { Play, Timer } from "lucide-react";

const durations = [15, 25, 50];
const button = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50";

export default function FocusTimer({ session }) {
    const { progress, duration, setDuration, busy, error, seconds, changeSession, refresh, completedSession } = session;
    const active = progress?.active;
    const remaining = active ? seconds : duration * 60;
    const angle = 360 * Math.min(1, remaining / ((active?.minutes || duration) * 60));

    return (
        <section aria-label="Focus timer" className="rounded-xl border border-[#dbe6e0] bg-white p-5 text-center sm:p-8">
            <div className="flex flex-wrap justify-center gap-2" aria-label="Session duration">
                {durations.map((minutes) => (
                    <button key={minutes} type="button" disabled={busy || Boolean(active)} aria-pressed={(active?.minutes ?? duration) === minutes}
                        onClick={() => setDuration(minutes)} className={button + ((active?.minutes ?? duration) === minutes ? " bg-[#e7f0ec] text-[#346557]" : " border border-[#dbe6e0]")}>
                        {minutes} min
                    </button>
                ))}
            </div>
            <div className="mx-auto my-7 grid aspect-square w-52 max-w-full place-items-center rounded-full p-2.5 sm:w-60"
                style={{ background: `conic-gradient(#4d8172 ${angle}deg, #e7f0ec 0)` }}>
                <div className="grid size-full content-center rounded-full bg-white">
                    <p role="timer" className="text-5xl font-semibold tabular-nums tracking-tight">
                        {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
                    </p>
                    <p className="mt-2 text-sm text-[#526c62]">{active ? (seconds ? "Focusing" : "Finishing session…") : progress ? "Ready" : error ? "Unavailable" : "Loading…"}</p>
                </div>
            </div>
            {error && <p role="alert" className="mb-4 text-sm text-red-700">{error} <button type="button" onClick={refresh} className="underline">Retry</button></p>}
            {!active && completedSession && <p role="status" className="mb-4 font-semibold text-[#346557]">Session complete · {completedSession.minutes} minutes</p>}
            {active ? (
                <button type="button" disabled={busy || seconds === 0} onClick={() => changeSession(true)} className={button + " border border-[#dbe6e0]"}>End Early</button>
            ) : (
                <button type="button" disabled={busy || !progress} onClick={() => changeSession(false)} className={button + " bg-[#346557] text-white"}>
                    <Play size={16} aria-hidden="true" /> Start Focus
                </button>
            )}
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#526c62]">
                <Timer size={15} className="shrink-0" aria-hidden="true" /> Your timer keeps running if you refresh or leave this page.
            </p>
        </section>
    );
}
