import { Timer } from "lucide-react";
import { Link } from "react-router-dom";
import WeeklyStudyActivity from "@/components/dashboard/WeeklyStudyActivity.jsx";
import { useFocusSession } from "@/lib/useFocusSession.js";

export default function FocusSessions({ task }) {
    const { progress, seconds, error } = useFocusSession();

    return (
        <>
            <WeeklyStudyActivity days={progress?.days} error={error} />
            <section aria-labelledby="focus-title" className="rounded-xl border border-[#dbe6e0] bg-white p-4">
                <h2 id="focus-title" className="flex items-center gap-2 font-semibold"><Timer size={18} aria-hidden="true" /> Focus Session</h2>
                {progress?.active && <p className="mt-2 text-sm">Session running · {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} remaining</p>}
                <Link to={task ? `/focus-session?${new URLSearchParams({ task: task._id })}` : "/focus-session"} className="mt-3 inline-block text-sm font-semibold text-[#346557] hover:underline">
                    {progress?.active ? "Open timer" : "Start a focus session"}
                </Link>
            </section>
        </>
    );
}
