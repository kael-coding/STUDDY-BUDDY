import { UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudyGroupCard({ group }) {
    return (
        <li className="flex min-w-0 flex-col rounded-xl border border-[#dce7e1] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="grid size-9 place-items-center rounded-lg bg-[#e7f0ec] text-[#346557]">
                    <UsersRound size={17} aria-hidden="true" />
                </span>
                <span className="rounded-md bg-[#e7f0ec] px-2 py-1 text-xs font-medium text-[#346557] [overflow-wrap:anywhere]">{group.subject}</span>
            </div>
            <h3 className="mt-3 font-semibold [overflow-wrap:anywhere]">{group.name}</h3>
            <p className="mt-1 line-clamp-3 flex-1 text-sm text-[#526c62] [overflow-wrap:anywhere]">{group.description}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-[#526c62]">{group.memberCount} {group.memberCount === 1 ? "member" : "members"}{group.isMember && " · Joined"}</span>
                <Link to={`/community/groups/${group._id}`} aria-label={`Open ${group.name}`}
                    className="rounded-lg border border-[#cbd9d1] px-3 py-1.5 text-xs font-semibold text-[#346557] hover:bg-[#e7f0ec]">Open Group</Link>
            </div>
        </li>
    );
}
