import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/useChatStore.js";
import { useAuthStore } from "@/store/authStore.js";
import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageBubble from "./MessageBubble.jsx";
import MessageSkeleton from "./skeloton/MessageSkeleton.jsx";

export default function ChatContainer({ connected }) {
    const { messages, getMessages, isMessagesLoading, messagesError, selectedUser } = useChatStore();
    const accountId = useAuthStore((state) => state.user?._id);
    const messageList = useRef(null);
    const newestMessage = messages.at(-1)?._id;
    const contactId = selectedUser?._id;

    useEffect(() => { if (contactId) getMessages(contactId); }, [contactId, getMessages]);
    useEffect(() => {
        const list = messageList.current;
        if (list) list.scrollTop = list.scrollHeight;
    }, [newestMessage]);

    return (
        <section aria-label="Conversation" className="flex min-h-0 min-w-0 flex-1 flex-col">
            <ChatHeader connected={connected} />
            <div ref={messageList} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f8faf9] p-3 sm:p-4">
                {messagesError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                    {messagesError} <button type="button" className="underline" onClick={() => getMessages(contactId)}>Retry</button>
                </p>}
                {isMessagesLoading && !messages.length && <MessageSkeleton />}
                {!isMessagesLoading && !messagesError && !messages.length && <p className="p-4 text-center text-sm text-[#526c62]">No messages yet. Send one to start the conversation.</p>}
                {messages.map((message) => <MessageBubble key={message._id} message={message} own={message.senderId === accountId} />)}
            </div>
            {!connected && <p className="border-t border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">Live updates will resume when the connection returns.</p>}
            <MessageInput />
        </section>
    );
}
