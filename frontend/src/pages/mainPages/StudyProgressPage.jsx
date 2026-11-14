import { Link } from "react-router-dom";
import WeeklyStudyActivity from "@/components/dashboard/WeeklyStudyActivity.jsx";
import { useFocusSession } from "@/lib/useFocusSession.js";

export default function StudyProgressPage() {
    const { progress, error, refresh } = useFocusSession();
    return (
        <div className="mx-auto max-w-4xl py-4">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Study Progress</h1>
                    <p className="mt-1 text-sm text-[#526c62]">Monday to Sunday · Asia/Manila</p>
                </div>
                <Link to="/focus-session" className="text-sm font-semibold text-[#346557] hover:underline">Open Focus Session</Link>
            </header>
            {error && <p role="alert" className="mb-3 text-sm text-red-700">{error} <button type="button" onClick={refresh} className="underline">Retry</button></p>}
            <WeeklyStudyActivity days={progress?.days} error={error} expanded />
        </div>
    );
}
