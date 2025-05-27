import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";
import { FiMenu } from "react-icons/fi";

const typeIcons = {
    reminder: "📅",
    overDue: "⚠️",
    completed: "✅",
    like: "❤️",
    comment: "💬",
    likeComment: "👍"
};

const Navbar = ({ onToggleSidebar }) => {
    const location = useLocation();
    const { user } = useAuthStore();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const popoverRef = useRef();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const {
        notifications,
        fetchNotifications,
        markAsRead,
        markAsUnread,
        deleteNotification,
        loading
    } = useNotificationStore();

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Initial fetch and setup real-time updates
    useEffect(() => {
        fetchNotifications();

        // Set up polling for updates every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close popover when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setIsPopoverOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    if (user?.role === "superadmin") return null;

    const pageTitles = {
        "/user_dashboard": "Dashboard",
        "/task-scheduler": "Task Scheduler",
        "/digital-notebook": "Digital Notebook",
        "/community": "Community",
        "/messages": "Messages",
        "/archive": "Archive",
        "/profile": "Profile",
        "/notifications": "Notifications",
        "/setting/user/profile": "Settings",
        "/setting/user/security": "Settings",
    };

    const title = pageTitles[location.pathname] || "Study Buddy";
    const isMobile = windowWidth < 768;
    const hideHamburger = isMobile &&
        (location.pathname === "/messages" ||
            location.pathname.startsWith("/setting"));

    const handleToggleRead = async (id, isRead) => {
        if (isRead) {
            await markAsUnread(id);
        } else {
            await markAsRead(id);
        }
        // No need to manually fetch here - the store will handle it
    };

    return (
        <header className="bg-[#5C8D7D] text-white p-4 shadow flex justify-between items-center relative z-60">
            <div className="flex items-center gap-4">
                {!hideHamburger && (
                    <button
                        className="md:hidden"
                        onClick={onToggleSidebar}
                        aria-label="Toggle sidebar"
                    >
                        <FiMenu size={24} />
                    </button>
                )}
                <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
            </div>

            <div className="relative" ref={popoverRef}>
                <button
                    className="relative p-1 rounded-full hover:bg-[#4a7a6b] transition-colors"
                    onClick={() => {
                        setIsPopoverOpen(!isPopoverOpen);
                        if (!isPopoverOpen) {
                            fetchNotifications(); // Refresh when opening
                        }
                    }}
                    aria-label="Notifications"
                    aria-expanded={isPopoverOpen}
                >
                    <IoNotificationsOutline size={24} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>

                {isPopoverOpen && (
                    <div className={`absolute right-0 mt-2 w-80 md:w-96 bg-white text-black shadow-xl rounded-lg overflow-hidden z-50 
                        ${isMobile ? 'max-h-[calc(100vh-120px)]' : 'max-h-[80vh]'}`}
                    >
                        <div className="p-3 border-b font-semibold flex justify-between items-center sticky top-0 bg-white z-10">
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>

                        <ul className="overflow-y-auto divide-y">
                            {loading ? (
                                <li className="p-4 text-center text-gray-500">Loading...</li>
                            ) : notifications.length === 0 ? (
                                <li className="p-4 text-center text-gray-500">No notifications</li>
                            ) : (
                                notifications.map(n => {
                                    const icon = typeIcons[n.type] || "🔔";
                                    return (
                                        <li
                                            key={n._id}
                                            className={`p-3 text-sm ${!n.read ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-white'}`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <span className="text-lg">{icon}</span>
                                                <div className="flex-1">
                                                    <p className="font-medium">{n.text}</p>
                                                    <p className="text-gray-600 text-xs mt-1">{n.context}</p>
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        {new Date(n.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button
                                                    onClick={() => handleToggleRead(n._id, n.read)}
                                                    className="text-blue-600 hover:underline text-xs"
                                                >
                                                    {n.read ? "Mark as Unread" : "Mark as Read"}
                                                </button>
                                                <button
                                                    onClick={() => deleteNotification(n._id)}
                                                    className="text-red-600 hover:underline text-xs"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })
                            )}
                        </ul>

                        <div className="sticky bottom-0 bg-white border-t p-2 text-center">
                            <a
                                href="/notifications"
                                className="text-blue-600 hover:underline text-sm"
                                onClick={() => setIsPopoverOpen(false)}
                            >
                                View all notifications
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;