import { useChatStore } from '@/store/useChatStore';
import { useEffect, useState, useRef } from 'react';
import SidebarSkeleton from '@/components/messagescomponent/skeloton/sidebarSkeleton';
import { useAuthStore } from '@/store/authStore';

const SideMessageBar = () => {
    const users = useChatStore((state) => state.users);
    const selectedUser = useChatStore((state) => state.selectedUser);
    const setSelectedUser = useChatStore((state) => state.setSelectedUser);
    const isUsersLoading = useChatStore((state) => state.isUsersLoading);
    const loggedInUser = useChatStore((state) => state.loggedInUser);

    const getUsers = useChatStore.getState().getUsers;
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const hasFetchedUsers = useRef(false);

    const { onlineUsers } = useAuthStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    // Initial fetch
    useEffect(() => {
        if (!hasFetchedUsers.current && users.length === 0) {
            getUsers();
            hasFetchedUsers.current = true;
        }
    }, [users.length, getUsers]);

    // Search + filter
    useEffect(() => {
        const q = searchQuery.trim().toLowerCase();
        const base = showOnlineOnly
            ? users.filter((u) => onlineUsers.includes(u._id))
            : users;

        if (!q) return setFilteredUsers([]);
        setFilteredUsers(
            base.filter(
                (u) =>
                    u._id !== loggedInUser?._id &&
                    u.userName.toLowerCase().includes(q)
            )
        );
    }, [searchQuery, users, loggedInUser, showOnlineOnly, onlineUsers]);

    const usersToDisplay = (searchQuery.trim() ? filteredUsers : showOnlineOnly
        ? users.filter((u) => onlineUsers.includes(u._id))
        : users
    ).filter((u) => u._id !== loggedInUser?._id);

    if (isUsersLoading) return <SidebarSkeleton />;

    return (
        <>


            <aside aria-label="Contacts" className="p-4">
                <div className="mb-4">
                    <input
                        type="search"
                        aria-label="Search contacts"
                        className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A7C56]"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Online-only toggle */}
                <div className="mb-3 flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={showOnlineOnly}
                            onChange={(e) => setShowOnlineOnly(e.target.checked)}
                            className="checkbox checkbox-sm"
                        />
                        <span className="text-sm">Show online only</span>
                    </label>
                    <span className="text-xs text-zinc-500">
                        ({onlineUsers.length - 1} online)
                    </span>
                </div>

                {/* Users List */}
                {usersToDisplay.length === 0 ? (
                    <div className="text-center text-gray-500">
                        {searchQuery.trim() === ''
                            ? 'Search to start a conversation'
                            : 'No users found'}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {usersToDisplay
                            .filter((u) => !['superadmin', 'admin'].includes(u.role))
                            .map((u) => (
                                <button
                                    key={u._id}
                                    onClick={() => setSelectedUser(u)}
                                    className={`w-full p-3 flex items-center gap-3 transition-colors rounded-lg
                    ${selectedUser?._id === u._id
                                            ? 'bg-[#5C8D7D] text-white'
                                            : 'hover:bg-[#74b09c]/20'}
                  `}
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 bg-[#c9d5cf] text-[#37433e] rounded-full flex items-center justify-center overflow-hidden text-base">
                                            {u.profilePicture ? (
                                                <img
                                                    src={u.profilePicture}
                                                    alt={u.userName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                u.userName.charAt(0)
                                            )}
                                        </div>
                                        {onlineUsers.includes(u._id) && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                                        )}
                                    </div>
                                    {/* Name & Status */}
                                    <div className="flex flex-col text-left truncate">
                                        <span className="font-medium">{u.userName}</span>
                                        <span
                                            className={`text-sm ${selectedUser?._id === u._id
                                                ? 'text-gray-200'
                                                : 'text-gray-500'
                                                }`}
                                        >
                                            {onlineUsers.includes(u._id) ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                    </div>
                )}
            </aside>
        </>
    );
};

export default SideMessageBar;
