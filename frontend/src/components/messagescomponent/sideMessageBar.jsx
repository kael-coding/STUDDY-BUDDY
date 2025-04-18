import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import { useEffect, useState, useRef } from 'react';
import SidebarSkeleton from './skeloton/sidebarSkeleton';
import { useAuthStore } from '../../store/authStore';

const SideMessageBar = () => {
    const navigate = useNavigate();

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

    useEffect(() => {
        if (!hasFetchedUsers.current && users.length === 0) {
            getUsers();
            hasFetchedUsers.current = true;
        }
    }, [users.length, getUsers]);

    // Search + Online filter logic
    useEffect(() => {
        const query = searchQuery.trim().toLowerCase();
        const baseList = showOnlineOnly
            ? users.filter((user) => onlineUsers.includes(user._id))
            : users;

        if (query === '') {
            setFilteredUsers([]);
        } else {
            setFilteredUsers(
                baseList.filter(
                    (user) =>
                        user._id !== loggedInUser?._id &&
                        user.userName.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, users, loggedInUser, showOnlineOnly, onlineUsers]);

    const usersToDisplay = (searchQuery.trim() !== '' ? filteredUsers : (showOnlineOnly
        ? users.filter((user) => onlineUsers.includes(user._id))
        : users
    )).filter((user) => user._id !== loggedInUser?._id);

    if (isUsersLoading) return <SidebarSkeleton />;

    return (
        <aside className="w-full md:w-1/3 p-5 shadow-lg overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full text-black text-xl flex items-center justify-center shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                    aria-label="Close sidebar"
                >
                    &times;
                </button>
                <h2 className="text-lg font-bold">Messages</h2>
            </div>

            {/* Search */}
            <input
                type="text"
                className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A7C56] mb-2"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Show Online Only Toggle - moved below search */}
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

            {/* Results */}
            {
                usersToDisplay.length === 0 ? (
                    <div className="text-center text-gray-500">
                        {searchQuery.trim() === ''
                            ? 'Search to start a conversation'
                            : 'No users found'}
                    </div>
                ) : (
                    <div className="overflow-y-auto w-full py-3">
                        {usersToDisplay
                            .filter((user) => !['superadmin', 'admin'].includes(user.role))
                            .map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`w-full p-3 flex items-center gap-3 transition-colors 
                                    ${selectedUser?._id === user._id
                                            ? 'bg-[#5C8D7D] ring-1 ring-[#5C8D7D]'
                                            : 'hover:bg-[#74b09c]'} 
                                `}
                                >
                                    {/* Avatar */}
                                    <div className="relative mx-auto lg:mx-0">
                                        <div className="w-12 h-12 bg-[#c9d5cf] text-[#37433e] rounded-full font-semibold flex items-center justify-center overflow-hidden text-sm sm:text-base">
                                            {user.profilePicture ? (
                                                <img
                                                    src={user.profilePicture}
                                                    alt={user.userName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                user.userName.charAt(0)
                                            )}
                                        </div>
                                        {onlineUsers.includes(user._id) && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                                        )}
                                    </div>
                                    <div className="hidden lg:block text-left min-w-0">
                                        <div className="font-medium truncate text-black">{user.userName}</div>
                                        <div
                                            className={`text-sm ${selectedUser?._id === user._id
                                                ? 'text-zinc-200'
                                                : 'text-zinc-400'}`}
                                        >
                                            {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                                        </div>
                                    </div>
                                </button>
                            ))}
                    </div>
                )
            }
        </aside>
    );
};

export default SideMessageBar;
