import { MessagesSquare, UsersRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const sectionLink = ({ isActive }) => `inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold ${
    isActive ? "border-[#346557] text-[#294f43]" : "border-transparent text-[#526c62] hover:bg-[#e7f0ec]"
}`;

export default function CommunityWorkspace() {
    return (
        <div className="mx-auto max-w-6xl space-y-5 py-3 sm:py-5">
            <header className="flex items-center gap-4 rounded-2xl border border-[#dce7e1] bg-[#e7f0ec] p-5 sm:p-7">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white text-[#346557]">
                    <UsersRound size={24} aria-hidden="true" />
                </span>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#233e35] sm:text-3xl">Community</h1>
                    <p className="mt-1 text-sm text-[#526c62]">Ask questions, share resources, and study with classmates.</p>
                </div>
            </header>
            <nav aria-label="Community sections" className="flex flex-wrap gap-2 border-b border-[#dce7e1]">
                <NavLink to="/community" end className={sectionLink}>
                    <MessagesSquare size={17} aria-hidden="true" /> Feed
                </NavLink>
                <NavLink to="/community/groups" className={sectionLink}>
                    <UsersRound size={17} aria-hidden="true" /> Study Groups
                </NavLink>
            </nav>
            <Outlet />
        </div>
    );
}
