import { BookOpen, CalendarDays, ChevronRight, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickAccess({ taskCount, noteCount, newPostCount }) {
    const links = [
        { to: "/task-scheduler", label: "Open Planner", detail: `${taskCount} open tasks`, icon: <CalendarDays size={16} aria-hidden="true" /> },
        { to: "/digital-notebook", label: "Browse Library", detail: `${noteCount} notes`, icon: <BookOpen size={16} aria-hidden="true" /> },
        { to: "/community", label: "Explore Groups", detail: `${newPostCount} new posts today`, icon: <Users size={16} aria-hidden="true" /> },
    ];

    return (
        <nav aria-labelledby="quick-access-title" className="rounded-xl border border-[#dbe6e0] bg-white p-4">
            <h2 id="quick-access-title" className="mb-2 font-semibold text-[#233e35]">Quick Access</h2>
            <ul>
                {links.map(({ to, label, detail, icon }) => (
                    <li key={to}>
                        <Link to={to} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#f0f6f2]">
                            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-[#e7f0ec] text-[#346557]">
                                {icon}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium text-[#233e35]">{label}</span>
                                <span className="block text-xs text-[#526c62]">{detail}</span>
                            </span>
                            <ChevronRight className="shrink-0 text-[#526c62]" size={16} aria-hidden="true" />
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
