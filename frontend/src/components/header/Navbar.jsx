import { useLocation } from "react-router-dom";
import { IoNotificationsOutline, IoMailOutline } from "react-icons/io5";
import { useAuthStore } from "../../store/authStore";// Assuming you're using the store to manage auth

const Navbar = () => {
    const location = useLocation();
    const { user } = useAuthStore(); // Get user from the auth store

    // If the user is a superadmin, return null (hide the header entirely)
    if (user?.role === "superadmin") {
        return null;
    }

    // Define titles based on the current pathname
    const pageTitles = {
        "/user_dashboard": "Dashboard",
        "/task-scheduler": "Task Scheduler",
        "/digital-notebook": "Digital Notebook",
        "/community": "Community",
        "/messages": "Messages",
        "/archive": "Archive",
        "/profile": "Profile",

    };

    const title = pageTitles[location.pathname] || "Study Buddy";

    return (
        <header className="bg-[#5C8D7D] text-white p-4 shadow flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            <div className="flex items-center gap-6">
                {/* Notifications Icon */}
                <div className="relative cursor-pointer">
                    <IoNotificationsOutline size={24} className="text-white-700" />
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        3
                    </span>
                </div>

                {/* Messages Icon */}
                <div className="relative cursor-pointer">
                    <IoMailOutline size={24} className="text-white-700" />
                    <span className="absolute -top-1.5 -right-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                        2
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
