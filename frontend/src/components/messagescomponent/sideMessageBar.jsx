import { useState } from "react";
import { MessageSquarePlus, Search, ShieldCheck } from "lucide-react";
import { useChatStore } from "@/store/useChatStore.js";
import { useAuthStore } from "@/store/authStore.js";
import ChatAvatar from "./ChatAvatar.jsx";
import ChatRoleBadge from "./ChatRoleBadge.jsx";
import NewChatDialog from "./NewChatDialog.jsx";
import SidebarSkeleton from "./skeloton/sidebarSkeleton.jsx";

const date = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric" });
const time = new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit" });
const previewTime = (value) => {
    const stamp = new Date(value);
    if (!value || !Number.isFinite(stamp.getTime())) return "";
    return stamp.toDateString() === new Date().toDateString() ? time.format(stamp) : date.format(stamp);
};

export default function SideMessageBar() {
    const { users, selectedUser, setSelectedUser, isUsersLoading, usersError, getUsers } = useChatStore();
    const { onlineUsers, user } = useAuthStore();
    const [search, setSearch] = useState("");
    const [onlineOnly, setOnlineOnly] = useState(false);
    const [newChat, setNewChat] = useState(null);
    const online = new Set(onlineUsers);
    const query = search.trim().toLowerCase();
    const contacts = users.filter((contact) => contact.lastMessage)
        .filter((contact) => (!onlineOnly || online.has(contact._id)) && contact.userName.toLowerCase().includes(query))
        .sort((a, b) => (Date.parse(b.lastMessage?.createdAt) || 0) - (Date.parse(a.lastMessage?.createdAt) || 0)
            || a.userName.localeCompare(b.userName));

    return (
        <aside aria-label="Conversations" className="flex h-full min-h-0 flex-col">
            <div className="space-y-3 border-b border-[#dce7e1] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="font-semibold">Messages</h1>
                    <button type="button" onClick={() => setNewChat("people")} className="inline-flex items-center gap-1.5 rounded-lg bg-[#346557] px-2.5 py-2 text-xs font-semibold text-white hover:bg-[#294f43]">
                        <MessageSquarePlus size={15} aria-hidden="true" /> New chat
                    </button>
                </div>
                {user?.role !== "admin" && (
                    <button type="button" onClick={() => setNewChat("admin")} className="inline-flex w-full items-center gap-2 rounded-lg border border-[#dce7e1] px-3 py-2 text-left text-sm font-semibold text-[#346557] hover:bg-[#e7f0ec]">
                        <ShieldCheck size={16} aria-hidden="true" /> Chat with an admin
                    </button>
                )}
                <label className="flex items-center gap-2 rounded-lg border border-[#cbd9d1] px-3 py-2 focus-within:border-[#346557]">
                    <Search size={16} className="shrink-0 text-[#526c62]" aria-hidden="true" />
                    <input type="search" aria-label="Search conversations" placeholder="Search conversations" value={search}
                        onChange={(event) => setSearch(event.target.value)} className="w-full min-w-0 text-sm outline-none" />
                </label>
                <label className="flex items-center gap-2 text-xs text-[#526c62]"><input type="checkbox" checked={onlineOnly}
                    onChange={(event) => setOnlineOnly(event.target.checked)} /> Online only</label>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
                {usersError && <p role="alert" className="p-4 text-sm text-red-700">{usersError} <button type="button" onClick={getUsers} className="underline">Retry</button></p>}
                {isUsersLoading && !users.length && <SidebarSkeleton />}
                {!isUsersLoading && !usersError && !contacts.length && <p className="p-4 text-sm text-[#526c62]">
                    {query || onlineOnly ? "No matching conversations." : "No conversations yet. Choose New chat to start one."}
                </p>}
                <ul className="divide-y divide-[#edf2ef]">
                    {contacts.map((contact) => {
                        const active = selectedUser?._id === contact._id;
                        const last = contact.lastMessage;
                        const preview = last.text || (last.images?.length ? "Image attachment" : "Message");
                        return <li key={contact._id}>
                            <button type="button" aria-pressed={active} onClick={() => setSelectedUser(contact)}
                                className={`flex w-full gap-3 p-4 text-left ${active ? "bg-[#e7f0ec]" : "hover:bg-[#f8faf9]"}`}>
                                <ChatAvatar user={contact} online={online.has(contact._id)} />
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-baseline justify-between gap-2">
                                        <span className="flex min-w-0 items-center gap-1.5">
                                            <span className="min-w-0 truncate text-sm font-semibold">{contact.userName}</span>
                                            <ChatRoleBadge role={contact.role} />
                                        </span>
                                        <time dateTime={last.createdAt} className="shrink-0 text-[11px] text-[#526c62]">{previewTime(last.createdAt)}</time>
                                    </span>
                                    <span className="mt-0.5 block truncate text-xs text-[#526c62]">{last?.senderId === user?._id ? "You: " : ""}{preview}</span>
                                </span>
                            </button>
                        </li>;
                    })}
                </ul>
            </div>
            {newChat && <NewChatDialog key={newChat} adminOnly={newChat === "admin"} onClose={() => setNewChat(null)}
                onSelect={(contact) => { setNewChat(null); setSelectedUser(contact); }} />}
        </aside>
    );
}
