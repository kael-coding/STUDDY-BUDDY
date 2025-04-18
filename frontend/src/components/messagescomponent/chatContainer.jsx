import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeloton/MessageSkeleton';
import { useAuthStore } from '../../store/authStore';
import { formatMessageTime } from '../../lib/utils/formatTime.js'

const ChatContainer = () => {
    const { messages, getMessages, isMessagesLoading, selectedUser, subcriptionToMessage, unsubscribeFromMessages } = useChatStore();
    const { user } = useAuthStore();
    const messageEndRef = useRef(null)

    useEffect(() => {
        getMessages(selectedUser._id);

        subcriptionToMessage()

        return () => unsubscribeFromMessages();
    }, [selectedUser._id, getMessages, subcriptionToMessage, unsubscribeFromMessages]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" })
        }

    }, [messages])

    if (isMessagesLoading) return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader />
            <MessageSkeleton />
        </div>
    );

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Sticky ChatHeader */}
            <div className="sticky top-0 z-10 bg-white shadow-md">
                <ChatHeader />
            </div>

            <div className="flex-1 overflow-y-auto pb-16">
                {/* Messages */}
                {messages.map((message) => (
                    <div key={message._id} className={`chat ${message.senderId === user._id ? 'chat-end' : 'chat-start'}`}
                        ref={messageEndRef}
                    >
                        <div className="chat-image avatar">
                            <div className="w-10 h-10 rounded-full border">
                                <img
                                    src={message.senderId === user._id
                                        ? user.profilePicture || (user.name ? user.name.charAt(0).toUpperCase() : '')
                                        : selectedUser.profilePicture || (selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : '')}
                                    alt="profilePicture"
                                />
                            </div>
                        </div>
                        <div className="chat-header mb-1">
                            <time className="text-xs opacity-50 ml-1">
                                {formatMessageTime(message.createdAt)}
                            </time>
                        </div>
                        <div className="chat-bubble flex flex-col">
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Attachment"
                                    className="sm:max-w-[200px] rounded-md mb-2"
                                />
                            )}
                            {message.text && <p>{message.text}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Fixed MessageInput at the bottom */}
            <div className="mt-auto bg-white">
                <MessageInput />
            </div>
        </div>
    );
};

export default ChatContainer;
