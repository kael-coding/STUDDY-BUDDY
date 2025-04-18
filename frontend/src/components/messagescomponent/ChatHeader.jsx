import { X } from "lucide-react";
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/authStore';

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();

    if (!selectedUser) return null;

    return (
        <div className="p-2.5 border-b border-base-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 text-white overflow-hidden">
                        {selectedUser.profilePicture ? (
                            <img
                                src={selectedUser.profilePicture}
                                alt={selectedUser.userName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-medium">
                                {selectedUser.userName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* User info */}
                    <div>
                        <h3 className="font-medium">{selectedUser.userName}</h3>
                        <p className="text-sm text-gray-500">
                            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close chat"
                >
                    <X />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
