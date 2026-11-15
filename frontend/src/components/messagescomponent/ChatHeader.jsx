import { ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { useChatStore } from "@/store/useChatStore.js";
import { useAuthStore } from "@/store/authStore.js";
import ChatAvatar from "./ChatAvatar.jsx";
import ChatRoleBadge from "./ChatRoleBadge.jsx";

export default function ChatHeader({ connected }) {
    const { selectedUser, setSelectedUser } = useChatStore();
    const online = useAuthStore((state) => state.onlineUsers.includes(selectedUser?._id));
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#dce7e1] bg-white px-3 sm:gap-3 sm:px-4">
            <button type="button" aria-label="Back to conversations" onClick={() => setSelectedUser(null)}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-[#346557] hover:bg-[#e7f0ec]"><ArrowLeft size={19} aria-hidden="true" /></button>
            <ChatAvatar user={selectedUser} online={online} />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <h2 className="min-w-0 truncate text-sm font-semibold">{selectedUser.userName}</h2>
                    <ChatRoleBadge role={selectedUser.role} />
                </div>
                <p className="text-xs text-[#526c62]">{online ? "Online" : "Offline"}</p>
            </div>
            <span role="status" className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${connected ? "bg-[#e7f0ec] text-[#346557]" : "bg-amber-50 text-amber-800"}`}>
                {connected ? <Wifi size={14} aria-hidden="true" /> : <WifiOff size={14} aria-hidden="true" />}
                {connected ? "Connected" : "Reconnecting…"}
            </span>
        </header>
    );
}
