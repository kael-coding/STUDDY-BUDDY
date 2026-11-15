import { UserRound } from "lucide-react";

const roleLabels = { user: "Student", admin: "Admin" };

export default function AccountSummary({ user, showEmail = false, children }) {
    return (
        <section aria-label="Account summary" className="overflow-hidden rounded-xl border border-[#dce7e1] bg-white">
            <div className="h-16 bg-[#467467]" aria-hidden="true" />
            <div className="flex flex-wrap items-end justify-between gap-3 px-5 pb-5">
                <div className="min-w-0">
                    <div className="relative -mt-5 grid size-14 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#e7f0ec] text-[#346557]">
                        {user.profilePicture ? <img src={user.profilePicture} alt="" className="size-full object-cover" /> : <UserRound size={23} aria-hidden="true" />}
                    </div>
                    <h2 className="mt-2 text-lg font-semibold [overflow-wrap:anywhere]">{user.userName}</h2>
                    {showEmail && <p className="text-sm text-[#526c62] [overflow-wrap:anywhere]">{user.email}</p>}
                    <p className="mt-1 text-xs font-medium text-[#346557]">{roleLabels[user.role]}</p>
                </div>
                {children}
            </div>
        </section>
    );
}
