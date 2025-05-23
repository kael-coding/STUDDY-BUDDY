import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
    AiOutlineHome,
    AiOutlineCalendar,
    AiOutlineBook,
    AiOutlineTeam,
    AiOutlineMessage,
    AiOutlineFolderOpen,
} from "react-icons/ai";
import { IoIosLogOut } from "react-icons/io";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io"; // Import for close icon

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout, user, isCheckingAuth } = useAuthStore();
    const [isLogoutConfirm, setIsLogoutConfirm] = useState(false);
    const [profilePicture, setProfilePicture] = useState(user.profilePicture || "");

    useEffect(() => {
        setProfilePicture(user.profilePicture || "");
    }, [user.profilePicture]);

    if (isCheckingAuth) {
        return <div className="p-5">Loading...</div>;
    }

    const userName = user?.userName || "Guest";
    const email = user?.email || "guest@example.com";

    const isActive = (path) =>
        location.pathname === path
            ? "bg-[#c9d5cf] text-[#37433e] font-medium"
            : "text-white";

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
                    onClick={onClose}
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#b8c7c0] cursor-pointer ${isActive("/user_dashboard")}`}
                >
                    <AiOutlineHome /> Dashboard
                </Link>
            </li>
            <li>
                <Link
                    to="/task-scheduler"
                    onClick={onClose}
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#c9d5cf] cursor-pointer ${isActive("/task-scheduler")}`}
                >
                    <AiOutlineCalendar /> To-Do List
                </Link>
            </li>
            <li>
                <Link
                    to="/digital-notebook"
                    onClick={onClose}
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#c9d5cf] cursor-pointer ${isActive("/digital-notebook")}`}
                >
                    <AiOutlineBook /> Notebook
                </Link>
            </li>
            <li>
                <Link
                    to="/messages"
                    onClick={onClose}
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#c9d5cf] cursor-pointer ${isActive("/messages")}`}
                >
                    <AiOutlineMessage /> Messages
                </Link>
            </li>
            <li>
                <Link
                    to="/community"
                    onClick={onClose}
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#c9d5cf] cursor-pointer ${isActive("/community")}`}
                >
                    <AiOutlineTeam /> Community
                </Link>
            </li>
            <h3 className="text-sm text-[#f0f7f4] mt-5">QUICK ACCESS</h3>
            <li>
                <Link
                    to="/archive"
                    onClick={onClose}
                    className={`p-2 rounded flex items-center mt-2 gap-2 hover:bg-[#c9d5cf] cursor-pointer ${isActive("/archive")}`}
                >
                    <AiOutlineFolderOpen /> Archive
                </Link>
            </li>
        </>
    );

    return (
        <>
            {/* Blur Overlay for mobile */}
            <div
                className={`fixed inset-0 backdrop-blur-sm bg-black/30 z-40 md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            ></div>

            <aside
                className={`fixed top-16 left-0 w-[18rem] h-[calc(100vh-4rem)] bg-[#5C8D7D] p-5 text-white shadow-lg transform transition-transform duration-300 z-50
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                md:relative md:top-0 md:h-full md:w-[18rem] md:overflow-y-auto md:translate-x-0
                flex flex-col box-border`}
            >
                {/* Close button on mobile */}
                <button
                    className="md:hidden absolute top-3 right-3 text-white text-2xl"
                    onClick={onClose}
                    aria-label="Close sidebar"
                >
                    <IoMdClose />
                </button>

                <div className="flex flex-col justify-between flex-1">
                    <div>
                        <h1 className="text-xl font-bold">Study Buddy</h1>
                        <p className="text-sm text-[#e6ecea]">Student Productivity Platform</p>
                        <nav className="mt-5">
                            <ul>{user?.role === "superadmin" ? renderAdminLinks() : renderUserLinks()}</ul>
                        </nav>
                    </div>

                    <div className="mt-8 pt-4 border-t border-[#b4c6bf]">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#c9d5cf] text-[#37433e] rounded-full font-semibold flex items-center justify-center overflow-hidden text-sm sm:text-base">
                                    {profilePicture ? (
                                        <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        userName.charAt(0)
                                    )}
                                </div>
                                <a href="/profile" className="flex flex-col max-w-[8rem] md:max-w-full">
                                    <p className="text-sm font-semibold text-ellipsis overflow-hidden whitespace-nowrap">{userName}</p>
                                    <p className="text-xs text-[#f0f7f4] text-ellipsis overflow-hidden whitespace-nowrap">{email}</p>
                                </a>
                            </div>
                            <button className="text-red-200 hover:text-red-500" onClick={confirmlogut}>
                                <IoIosLogOut size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {isLogoutConfirm && (
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md bg-black/30 bg-opacity-50 z-70">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center z-60">
                        <h2 className="text-lg font-bold text-gray-800">Are you sure?</h2>
                        <p className="text-gray-600 mt-2">Do you want to logout from your account?</p>
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-400"
                                onClick={() => setIsLogoutConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-400"
                                onClick={handlelogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
