import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { AiOutlineHome, AiOutlineCalendar, AiOutlineBook, AiOutlineTeam, AiOutlineMessage } from "react-icons/ai";
import { IoIosLogOut } from "react-icons/io";

const Sidebar = () => {
    const location = useLocation();
    const { user, isCheckingAuth } = useAuthStore();

    // Show loading state if authentication is still being checked
    if (isCheckingAuth) {
        return <div className="p-5">Loading...</div>;
    }

    // Safely extract user details with fallback values
    const userName = user?.userName || "Guest";
    const email = user?.email || "guest@example.com";

    const isActive = (path) => location.pathname === path ? "bg-blue-200" : "";

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
            <div className="mt-5 p-4 border-t flex flex-row items-center"> {/* Removed justify-start */}
                <div className="flex items-center gap-3 w-full"> {/* Ensures content takes full width */}
                    <span className="bg-blue-500 text-white p-2 rounded-full text-sm font-bold w-10 h-10 flex items-center justify-center">
                        {userName.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex flex-col">
                        <p className="text-sm font-semibold">{userName}</p>
                        <p className="text-xs text-gray-500">{email}</p>
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-200 transition"> {/* No ml-auto to prevent shifting */}
                    <IoIosLogOut size={22} />
                </button>
            </div>



        </aside>
    );
};

export default Sidebar;
