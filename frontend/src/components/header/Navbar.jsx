import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import { useAuthStore } from "../../store/authStore";
import axios from "axios";
import { FiMenu } from "react-icons/fi";

const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/notification"
    : "/api/notification";

const typeDetails = {
    reminder: { icon: "📅", message: "Task reminder." },
    overDue: { icon: "⚠️", message: "A task is overdue!" },
    completed: { icon: "✅", message: "Task completed." },
    like: { icon: "❤️", message: "Someone liked your post." },
    comment: { icon: "💬", message: "New comment on your post." },
    reply: { icon: "↩️", message: "New reply to your comment." },
    likeComment: { icon: "👍", message: "Someone liked your comment." }
};

const Navbar = ({ onToggleSidebar }) => {
    const location = useLocation();
    const { user } = useAuthStore();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const popoverRef = useRef();

    // Track window width for responsive behavior
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        function handleClickOutside(e) {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setIsPopoverOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/all`, { withCredentials: true });
            setNotifications(res.data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.patch(`${API_URL}/${id}/read`, {}, { withCredentials: true });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Mark as read failed", err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

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

    // Check if we are on mobile (width < 768)
    const isMobile = windowWidth < 768;
    // Hide hamburger on messages page or any settings page in mobile view
    const hideHamburger = isMobile &&
        (location.pathname === "/messages" ||
            location.pathname.startsWith("/setting"));

    return (
        <header className="bg-[#5C8D7D] text-white p-4 shadow flex justify-between items-center relative z-60">
            <div className="flex items-center gap-4">
                {/* Conditionally render hamburger */}
                {!hideHamburger && (
                    <button className="md:hidden" onClick={onToggleSidebar}>
                        <FiMenu size={24} />
                    </button>
                )}
                <h1 className="text-2xl font-semibold">{title}</h1>
            </div>

            <div className="relative" ref={popoverRef}>
                <div
                    className="relative cursor-pointer"
                    onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                >
                    <IoNotificationsOutline size={24} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {unreadCount}
                        </span>
                    )}
                </div>

                {isPopoverOpen && (
                    <div className="absolute right-0 mt-3 w-96 bg-white text-black shadow-xl rounded-lg overflow-hidden z-50">
                        <div className="p-4 border-b font-semibold flex justify-between items-center">
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                        <ul className="max-h-80 overflow-y-auto divide-y">
                            {loading ? (
                                <li className="p-4 text-center text-gray-500">Loading...</li>
                            ) : notifications.length === 0 ? (
                                <li className="p-4 text-center text-gray-500">No notifications</li>
                            ) : (
                                notifications.map(n => {
                                    const { icon, message } = typeDetails[n.type] || { icon: "🔔", message: n.type };
                                    return (
                                        <li key={n._id} className={`p-4 text-sm ${!n.read ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-white'}`}>
                                            <p className="font-medium mb-1">{icon} {message}</p>
                                            {n.createdAt && (
                                                <p className="text-gray-600 text-xs mb-2">
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </p>
                                            )}
                                            <div className="flex justify-end gap-2">
                                                {!n.read && (
                                                    <button onClick={() => markAsRead(n._id)} className="text-blue-600 hover:underline">
                                                        Mark as Read
                                                    </button>
                                                )}
                                                <button onClick={() => deleteNotification(n._id)} className="text-red-600 hover:underline">
                                                    Delete
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                        <a href="/notifications" className="block text-center text-blue-600 hover:underline p-4">
                            View all notifications
                        </a>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;