import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useUserStore } from "../../store/userStore";
import {
    AiOutlineHome,
    AiOutlineCalendar,
    AiOutlineBook,
    AiOutlineTeam,
    AiOutlineMessage,
    AiOutlineFolderOpen,
} from "react-icons/ai";
import { IoIosLogOut } from "react-icons/io";
import { useState } from "react";

const Sidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuthStore();
    const { isCheckingAuth } = useUserStore();
    const [isLogoutConfirm, setIsLogoutConfirm] = useState(false);

    if (isCheckingAuth) {
        return <div className="p-5">Loading...</div>;
    }

    const userName = user?.userName || "Guest";
    const email = user?.email || "guest@example.com";

    const isActive = (path) =>
        location.pathname === path ? "bg-[#c9d5cf] text-[#37433e] font-medium" : "text-white";

    const confirmlogut = () => setIsLogoutConfirm(true);

    const handlelogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout Error:", err.response?.data || err.message);
        }
    };

    const renderAdminLinks = () => (
        <>
            <h3 className="text-sm text-[#f0f7f4] mt-5">ADMIN SECTION</h3>
            <li>
                <Link
                    to="/super-admin-dashboard"
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#b8c7c0] cursor-pointer ${isActive("/super-admin-dashboard")}`}
                >
                    <AiOutlineHome /> Super Admin Dashboard
                </Link>
            </li>
            <li>
                <Link
                    to="/user_management"
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#b8c7c0] cursor-pointer ${isActive("/user_management")}`}
                >
                    <AiOutlineTeam /> User Management
                </Link>
            </li>
            <li>
                <Link
                    to="/admin_reports"
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#b8c7c0] cursor-pointer ${isActive("/admin_reports")}`}
                >
                    <AiOutlineFolderOpen /> Admin Reports
                </Link>
            </li>
        </>
    );

    const renderUserLinks = () => (
        <>
            <h3 className="text-sm text-[#f0f7f4]">MAIN LAYOUT</h3>
            <li>
                <Link
                    to="/user_dashboard"
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#b8c7c0] cursor-pointer ${isActive("/user_dashboard")}`}
                >
                    <AiOutlineHome /> Dashboard
                </Link>
            </li>
            <li>
                <Link
                    to="/task-scheduler"
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#c9d5cf] cursor-pointer ${isActive("/task-scheduler")}`}
                >
                    <AiOutlineCalendar /> Task Scheduler
                </Link>
            </li>
            <li>
                <Link
                    to="/digital-notebook"
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#c9d5cf] cursor-pointer ${isActive("/digital-notebook")}`}
                >
                    <AiOutlineBook /> Digital Notebook
                </Link>
            </li>
            <li>
                <Link
                    to="/community"
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#c9d5cf] cursor-pointer ${isActive("/community")}`}
                >
                    <AiOutlineTeam /> Community
                </Link>
            </li>
            <li>
                <Link
                    to="/messages"
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#c9d5cf] cursor-pointer ${isActive("/messages")}`}
                >
                    <AiOutlineMessage /> Messages
                </Link>
            </li>
            <h3 className="text-sm text-[#f0f7f4] mt-5">QUICK ACCESS</h3>
            <li>
                <Link
                    to="/archive"
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#c9d5cf] cursor-pointer ${isActive("/archive")}`}
                >
                    <AiOutlineFolderOpen /> Archive
                </Link>
            </li>
        </>
    );

    return (
        <aside className="w-64 bg-[#5C8D7D] p-5 text-white shadow-lg flex flex-col justify-between min-h-screen">
            {/* Top Section */}
            <div>
                <h1 className="text-xl font-bold">Study Buddy</h1>
                <p className="text-sm text-[#e6ecea]">Student Productivity Platform</p>
                <nav className="mt-5">
                    <ul>
                        {user?.role === "superadmin" ? renderAdminLinks() : renderUserLinks()}
                    </ul>
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="mt-5 p-3 border-t border-[#c8d3cd]">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="bg-[#c9d5cf] text-[#37433e] p-2 rounded-full font-semibold">
                            {userName.charAt(0).toUpperCase()}
                        </span>
                        <div>
                            <p className="text-sm font-semibold">{userName}</p>
                            <p className="text-xs text-[#f0f7f4]">{email}</p>
                        </div>
                    </div>
                    <button className="text-red-200 hover:text-red-500" onClick={confirmlogut}>
                        <IoIosLogOut size={22} />
                    </button>
                </div>
            </div>

            {/* Logout Modal */}
            {isLogoutConfirm && (
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center z-50">
                        <h2 className="text-lg font-bold text-gray-800">Are you sure?</h2>
                        <p className="text-gray-600 mt-2">Do you want to logout from your account?</p>
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg transition duration-200 hover:bg-gray-400"
                                onClick={() => setIsLogoutConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 text-white px-6 py-2 rounded-lg transition duration-200 hover:bg-red-400"
                                onClick={handlelogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
