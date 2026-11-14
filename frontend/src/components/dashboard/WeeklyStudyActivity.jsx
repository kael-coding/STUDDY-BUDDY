const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeeklyStudyActivity({ days, error, expanded = false }) {
    const totalMinutes = days?.reduce((total, day) => total + day.minutes, 0);
    const totalSessions = days?.reduce((total, day) => total + day.sessions, 0);
    const maxMinutes = days ? Math.max(1, ...days.map((day) => day.minutes)) : 1;

    return (
        <section aria-labelledby="progress-title" className="rounded-xl border border-[#dbe6e0] bg-white p-4">
            <h2 id="progress-title" className="font-semibold text-[#233e35]">Weekly Study Activity</h2>
            {days ? (
                <>
                    <dl className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-[#f0f6f2] p-3">
                            <dt className="text-xs text-[#526c62]">Focus minutes</dt>
                            <dd className="text-xl font-semibold text-[#233e35]">{totalMinutes}</dd>
                        </div>
                        <div className="rounded-lg bg-[#f0f6f2] p-3">
                            <dt className="text-xs text-[#526c62]">Completed sessions</dt>
                            <dd className="text-xl font-semibold text-[#233e35]">{totalSessions}</dd>
                        </div>
                    </dl>
                    <ul aria-label="Daily focus minutes, Manila time" className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-[#526c62]">
                        {days.map((day, index) => (
                            <li key={day.date} className="min-w-0">
                                <span className="block font-medium tabular-nums text-[#233e35]">{day.minutes}<span className="sr-only"> minutes</span></span>
                                <div aria-hidden="true" className={`mx-auto my-1 flex w-2/3 items-end rounded bg-[#edf3ef] ${expanded ? "h-40 max-w-14" : "h-12 max-w-8"}`}>
                                    <div className="w-full rounded bg-[#4d8172]" style={{ height: `${day.minutes / maxMinutes * 100}%` }} />
                                </div>
                                <span>{weekdays[index]}</span>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <p className="mt-2 text-sm text-[#526c62]">{error ? "Study activity is unavailable." : "Loading study activity…"}</p>
            )}
        </section>
    );
}
