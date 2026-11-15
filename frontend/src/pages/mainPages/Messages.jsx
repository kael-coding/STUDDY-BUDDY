import { useEffect, useState } from "react";
import NoChatSelected from "@/components/messagescomponent/noChatseleted.jsx";
import SideMessageBar from "@/components/messagescomponent/sideMessageBar.jsx";
import ChatContainer from "@/components/messagescomponent/chatContainer.jsx";
import { useChatStore } from "@/store/useChatStore.js";
import { useAuthStore } from "@/store/authStore.js";

export default function Messages() {
    const { selectedUser, getUsers, getMessages, receiveMessage, refreshConversation } = useChatStore();
    const socket = useAuthStore((state) => state.socket);
    const [connection, setConnection] = useState(null);
    const connected = Boolean(socket && (connection?.socket === socket ? connection.connected : socket.connected));

    useEffect(() => { getUsers(); }, [getUsers]);
    useEffect(() => {
        if (!socket) return;
        const onConnect = () => {
            setConnection({ socket, connected: true });
            getUsers();
            const active = useChatStore.getState().selectedUser;
            if (active) getMessages(active._id);
        };
        const onDisconnect = () => setConnection({ socket, connected: false });
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("newMessage", receiveMessage);
        socket.on("messageChanged", refreshConversation);
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("newMessage", receiveMessage);
            socket.off("messageChanged", refreshConversation);
        };
    }, [socket, getUsers, getMessages, receiveMessage, refreshConversation]);

    return (
        <div className="h-full p-0 sm:p-5 lg:px-8">
            <div className="mx-auto flex h-full min-h-0 max-w-6xl overflow-hidden border-[#dce7e1] bg-white sm:rounded-xl sm:border">
                <div className={`w-full shrink-0 md:w-[clamp(15rem,32%,20rem)] md:border-r md:border-[#dce7e1] ${selectedUser ? "hidden md:block" : ""}`}>
                    <SideMessageBar />
                </div>
                {selectedUser ? (
                    <ChatContainer key={selectedUser._id} connected={connected} />
                ) : (
                    <div className="hidden min-w-0 flex-1 items-center justify-center bg-[#f8faf9] md:flex"><NoChatSelected /></div>
                )}
            </div>
        </div>
    );
}
