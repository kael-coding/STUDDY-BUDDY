import { CalendarDays, ShieldCheck, Trash2, Users } from "lucide-react";
import { categoryFor } from "./notificationCategory.js";

const date = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" });
const categoryIcons = { tasks: CalendarDays, reports: ShieldCheck, community: Users };

export default function NotificationRow({ item, disabled, selected, onSelect, onToggle, onDelete }) {
    const Icon = categoryIcons[categoryFor(item)];
    const timestamp = Date.parse(item.createdAt);
    return (
        <li className={`flex flex-wrap items-center gap-3 px-4 py-3.5 ${item.read ? "" : "bg-[#edf6f1]"}`}>
            <input type="checkbox" aria-label={`Select notification: ${item.text}`} checked={selected} disabled={disabled} onChange={onSelect} />
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#dce7e1] bg-white text-[#346557]"><Icon size={17} aria-hidden="true" /></span>
            <div className="min-w-[10rem] flex-1 [overflow-wrap:anywhere]">
                <p className={`text-sm ${item.read ? "" : "font-semibold"}`}>{item.text}</p>
                {item.context && <p className="mt-0.5 text-xs text-[#526c62]">{item.context}</p>}
                <div className="mt-1 flex items-center gap-2 text-xs text-[#526c62]">
                    {Number.isFinite(timestamp) && <time dateTime={item.createdAt}>{date.format(timestamp)}</time>}
                    {!item.read && <span className="size-1.5 rounded-full bg-[#346557]" aria-label="Unread" />}
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button type="button" disabled={disabled} onClick={onToggle} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-[#346557] hover:bg-[#e7f0ec]">{item.read ? "Mark unread" : "Mark read"}</button>
                <button type="button" disabled={disabled} onClick={onDelete} aria-label="Delete notification" className="grid size-8 place-items-center rounded-lg text-[#526c62] hover:bg-red-50 hover:text-red-700"><Trash2 size={16} aria-hidden="true" /></button>
            </div>
        </li>
    );
}
