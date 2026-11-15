import { BookOpen, CheckCircle2, Flame, Layers, LockKeyhole, Timer, Trophy, UsersRound } from "lucide-react";

const icons = {
    "first-finish": CheckCircle2,
    "planner-pro": Trophy,
    "notebook-builder": BookOpen,
    "card-maker": Layers,
    "focus-hour": Timer,
    "study-streak": Flame,
    "group-founder": UsersRound,
};

export default function AchievementCard({ achievement }) {
    const { id, name, goal, earned, progress, target } = achievement;
    const Icon = icons[id] ?? Trophy;

    return (
        <li className="flex min-w-0 flex-col rounded-xl border border-[#dce7e1] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
                <span className={`grid size-10 place-items-center rounded-lg ${earned ? "bg-[#e7f0ec] text-[#346557]" : "bg-[#f0f4f2] text-[#526c62]"}`}>
                    <Icon size={22} aria-hidden="true" />
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${earned ? "bg-[#e7f0ec] text-[#294f43]" : "bg-[#f0f4f2] text-[#526c62]"}`}>
                    {earned ? <CheckCircle2 size={13} aria-hidden="true" /> : <LockKeyhole size={13} aria-hidden="true" />}
                    {earned ? "Unlocked" : "Locked"}
                </span>
            </div>
            <h2 className="mt-3 font-semibold text-[#233e35]">{name}</h2>
            <p className="mt-1 flex-1 text-sm text-[#526c62]">{goal}</p>
            {!earned && <div className="mt-3">
                <p className="mb-1 text-right text-xs tabular-nums text-[#526c62]">{progress} / {target}</p>
                <progress aria-label={`${name} progress`} value={progress} max={target}
                    className="block h-2 w-full overflow-hidden rounded-full accent-[#346557]" />
            </div>}
        </li>
    );
}
