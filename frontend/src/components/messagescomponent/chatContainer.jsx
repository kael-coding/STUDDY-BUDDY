import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useChatStore } from '../../store/useChatStore';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeloton/MessageSkeleton';
import { useAuthStore } from '../../store/authStore';
import { formatMessageTime } from '../../lib/utils/formatTime.js';
import { ArrowLeft } from 'lucide-react';

const ChatContainer = () => {
    const {
        messages,
        getMessages,
        isMessagesLoading,
        selectedUser,
        subcriptionToMessage,
        unsubscribeFromMessages,
        setSelectedUser,
    } = useChatStore();
    const { user } = useAuthStore();
    const messageEndRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    const openPreview = (url) => setPreviewImage(url);
    const closePreview = useCallback(() => setPreviewImage(null), []);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') closePreview();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closePreview]);

    useEffect(() => {
        if (!selectedUser?._id) return;
        getMessages(selectedUser._id);
        subcriptionToMessage();
        return () => unsubscribeFromMessages();
    }, [selectedUser?._id, getMessages, subcriptionToMessage, unsubscribeFromMessages]);

    useEffect(() => {
        if (messageEndRef.current && messages.length > 0) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (!selectedUser) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500 text-lg">
                Select a user to start chatting
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 flex flex-col h-full max-h-screen bg-gray-100">
                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-20 bg-white p-2 border-b flex items-center">
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="p-2 rounded-full hover:bg-gray-200"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="ml-4 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-2">
                            {selectedUser.profilePicture ? (
                                <img
                                    src={selectedUser.profilePicture}
                                    alt={selectedUser.userName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-sm font-medium text-white">
                                    {selectedUser.userName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <span className="font-medium">{selectedUser.userName}</span>
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:block">
                    <ChatHeader />
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
                    {isMessagesLoading ? (
                        <MessageSkeleton />
                    ) : (
                        messages.map((message) => {
                            const isOwnMessage = message.senderId === user._id;
                            const sender = isOwnMessage ? user : selectedUser;
                            const senderInitial = sender?.userName?.charAt(0).toUpperCase() || '?';

                            return (
                                <div
                                    key={message._id}
                                    className={`chat ${isOwnMessage ? 'chat-end' : 'chat-start'}`}
                                >
                                    <div className="chat-image avatar">
                                        <div className="w-10 h-10 rounded-full border bg-[#c9d5cf] flex items-center justify-center text-[#37433e] font-medium text-lg">
                                            {sender.profilePicture ? (
                                                <img
                                                    src={sender.profilePicture}
                                                    alt="profile"
                                                    className="object-cover w-full h-full rounded-full"
                                                />
                                            ) : (
                                                <span className="flex items-center justify-center w-full h-full">
                                                    {senderInitial}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="chat-header mb-1">
                                        <time className="text-xs opacity-50 ml-1">
                                            {formatMessageTime(message.createdAt)}
                                        </time>
                                    </div>
                                    <div className="chat-bubble flex flex-col">
                                        {message.images?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {message.images.map((imgUrl, index) => (
                                                    <img
                                                        key={index}
                                                        src={imgUrl}
                                                        alt={`Attachment ${index + 1}`}
                                                        className="sm:max-w-[150px] max-h-[200px] object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => openPreview(imgUrl)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {message.text && <p>{message.text}</p>}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messageEndRef} />
                </div>

                {/* Input */}
                <div className="sticky bottom-0 bg-white p-4 border-t z-10">
                    <MessageInput />
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
                    <div className="relative max-w-4xl w-full p-3 mt-10">
                        <button
                            onClick={closePreview}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors p-4 mt-10"
                            aria-label="Close preview"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        <div className="bg-black/50 rounded-lg overflow-hidden">
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="w-[90%] max-h-[60vh] sm:w-full sm:max-h-[80vh] mx-auto object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatContainer;
