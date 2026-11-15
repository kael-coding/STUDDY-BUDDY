import { useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

const itemClass = "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-[#e7f0ec]";

export default function AccountMenu({ user, roleLabel, onLogout }) {
    const [open, setOpen] = useState(false);
    const trigger = useRef(null);
    const name = user?.userName?.trim() || "Account";
    const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

    return (
        <div className="relative min-w-0"
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
            }}
            onKeyDown={(event) => {
                if (event.key === "Escape" && open) {
                    setOpen(false);
                    trigger.current?.focus();
                }
            }}>
            <button ref={trigger} type="button" aria-label={`Account options for ${name}`} aria-expanded={open}
                onClick={() => setOpen(!open)} className="flex h-10 items-center gap-2 rounded-lg pl-1 pr-2 hover:bg-[#e7f0ec]">
                <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e7f0ec] text-xs font-semibold text-[#365e53]">
                    {user?.profilePicture ? <img src={user.profilePicture} alt="" className="size-full object-cover" /> : initials}
                </span>
                <span className="hidden min-w-0 text-left sm:block">
                    <span className="block max-w-32 truncate text-sm font-semibold">{name}</span>
                    <span className="block text-xs text-[#526c62]">{roleLabel}</span>
                </span>
                <ChevronDown size={15} className="shrink-0 text-[#526c62]" aria-hidden="true" />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-52 overflow-hidden rounded-lg border border-[#dce7e1] bg-white shadow-lg">
                    <div className="border-b border-[#dce7e1] px-3 py-2 sm:hidden">
                        <div className="truncate text-sm font-semibold">{name}</div>
                        <div className="text-xs text-[#526c62]">{roleLabel}</div>
                    </div>
                    <Link to="/profile" onClick={() => setOpen(false)} className={itemClass}><UserRound size={16} aria-hidden="true" /> Profile</Link>
                    <Link to="/setting/user/profile" onClick={() => setOpen(false)} className={itemClass}><Settings size={16} aria-hidden="true" /> Settings</Link>
                    <button type="button" className={itemClass} onClick={() => {
                        trigger.current?.focus();
                        setOpen(false);
                        onLogout();
                    }}><LogOut size={16} aria-hidden="true" /> Log Out</button>
                </div>
            )}
        </div>
    );
}
