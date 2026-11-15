export default function TimerFace({ remaining, total, status, resting = false }) {
    const angle = 360 * Math.min(1, remaining / total);
    const color = resting ? "#9a7041" : "#4d8172";

    return (
        <div className="mx-auto my-7 grid aspect-square w-52 max-w-full place-items-center rounded-full p-2.5 sm:w-60"
            style={{ background: `conic-gradient(${color} ${angle}deg, #e7f0ec 0)` }}>
            <div className="grid size-full content-center rounded-full bg-white">
                <p role="timer" className="text-5xl font-semibold tabular-nums tracking-tight">
                    {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
                </p>
                <p role="status" className="mt-2 text-sm text-[#526c62]">{status}</p>
            </div>
        </div>
    );
}
