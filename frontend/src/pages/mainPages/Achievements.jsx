import { useEffect, useState } from "react";
import { RefreshCw, Trophy } from "lucide-react";
import axios from "axios";
import AchievementCard from "@/components/dashboard/AchievementCard.jsx";

export default function Achievements() {
    const [result, setResult] = useState(null);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        axios.get("/api/schedule/achievements", { signal: controller.signal })
            .then(({ data }) => { if (!controller.signal.aborted) setResult(data); })
            .catch((error) => {
                if (!controller.signal.aborted) setResult({ error: error.response?.data?.message || "Could not load achievements." });
            });
        return () => controller.abort();
    }, [refresh]);

    const reload = () => {
        setResult(null);
        setRefresh((value) => value + 1);
    };
    const badges = result?.achievements;
    const unlocked = badges?.filter((badge) => badge.earned).length;

    return (
        <div className="mx-auto max-w-6xl space-y-5 py-4">
            <header className="flex flex-wrap items-center gap-3 rounded-xl border border-[#dce7e1] bg-[#e7f0ec] p-5 sm:p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white text-[#346557]"><Trophy size={23} aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-[#233e35] sm:text-3xl">Achievements</h1>
                    <p className="mt-1 text-sm text-[#526c62]">{badges ? `${unlocked} of ${badges.length} badges unlocked` : "Track your study milestones."}</p>
                </div>
                <button type="button" disabled={!result} onClick={reload} className="inline-flex items-center gap-2 rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-sm font-semibold text-[#346557] hover:bg-[#f8faf9] disabled:opacity-50">
                    <RefreshCw size={15} aria-hidden="true" /> Refresh
                </button>
            </header>
            {!result && <p role="status" className="text-sm text-[#526c62]">Loading achievements…</p>}
            {result?.error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{result.error}</p>}
            {badges && <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {badges.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} />)}
            </ul>}
        </div>
    );
}
