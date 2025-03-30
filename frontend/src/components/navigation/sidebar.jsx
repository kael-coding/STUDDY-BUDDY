import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { AiOutlineHome, AiOutlineCalendar, AiOutlineBook, AiOutlineTeam, AiOutlineMessage } from "react-icons/ai";
import { IoIosLogOut } from "react-icons/io";
import { useState } from "react";

const Sidebar = () => {
    const location = useLocation();
    const { logout, user, isCheckingAuth } = useAuthStore();
    const [isLogoutConfirm, setIsLogoutConfirm] = useState(false);

    if (isCheckingAuth) {
        return <div className="p-5">Loading...</div>;
    }

    const userName = user?.userName || "Guest";
    const email = user?.email || "guest@example.com";

    const isActive = (path) => location.pathname === path ? "bg-blue-200" : "";


    const confirmlogut = () => {
        setIsLogoutConfirm(true);
    };
    const handlelogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout Error:", err.response?.data || err.message);
        }
    };

    return (
        <aside className="w-64 bg-white p-5 shadow-lg flex flex-col justify-between h-screen">
            <div>
                <h1 className="text-xl font-bold">Study Buddy</h1>
                <p className="text-sm text-gray-500">Student Productivity Platform</p>
                <nav className="mt-5">
                    <ul>
                        <li>
                            <Link
                                to="/user_dashboard"
                                className={`p-2 rounded flex items-center mt-2 gap-2 ${isActive("/user_dashboard")}`}
                            >
                                <AiOutlineHome size={20} /> Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/task-scheduler"
                                className={`p-2 rounded flex items-center mt-2 gap-2 ${isActive("/task-scheduler")}`}
                            >
                                <AiOutlineCalendar size={20} /> Task Scheduler
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/digital-notebook"
                                className={`p-2 rounded flex items-center mt-2 gap-2 ${isActive("/digital-notebook")}`}
                            >
                                <AiOutlineBook size={20} /> Digital Notebook
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/community"
                                className={`p-2 rounded flex items-center mt-2 gap-2 ${isActive("/community")}`}
                            >
                                <AiOutlineTeam size={20} /> Community
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/messages"
                                className={`p-2 rounded flex items-center mt-2 gap-2 ${isActive("/messages")}`}
                            >
                                <AiOutlineMessage size={20} /> Messages
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
            <div className="mt-7 p-4 border-t flex flex-row items-center">
                <div className="flex items-center gap-3 w-full">
                    <span className="bg-blue-500 text-white p-2 rounded-full text-sm font-bold w-10 h-10 flex items-center justify-center">
                        {userName.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex flex-col">
                        <p className="text-sm font-semibold">{userName}</p>
                        <p className="text-xs text-gray-500">{email}</p>
                    </div>
                </div>
                <button className="p-1 rounded-full hover:bg-gray-200 transition" onClick={confirmlogut}>
                    <IoIosLogOut size={22} />
                </button>

                {isLogoutConfirm && (
                    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                            <h2 className="text-lg font-bold">Confirm Logout</h2>
                            <p className="text-gray-600 mt-2">Are you sure you want to Logout?</p>
                            <div className="flex justify-center gap-4 mt-4">
                                <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setIsLogoutConfirm(false)}>No</button>
                                <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handlelogout}>Yes</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>

    );
};

export default Sidebar;
