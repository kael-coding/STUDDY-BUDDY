import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import AccountMenu from "@/components/header/AccountMenu.jsx";
import NotificationMenu from "@/components/header/NotificationMenu.jsx";
import { workspacePageTitle } from "@/components/navigation/workspaceNav.js";

export default function Navbar({ user, workspace, onOpenNavigation, onLogout, navigationOpen }) {
    const { pathname, hash } = useLocation();
    const title = workspacePageTitle(workspace, pathname, hash);

    return (
        <header className="relative z-30 flex h-16 shrink-0 items-center gap-3 border-b border-[#dce7e1] bg-white px-3 sm:px-6 lg:px-8">
            <button type="button" aria-label="Open navigation" aria-expanded={navigationOpen} aria-haspopup="dialog"
                onClick={onOpenNavigation} className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-[#e7f0ec] lg:hidden">
                <Menu size={20} aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1 truncate font-semibold">{title}</div>
            <div className="flex shrink-0 items-center gap-1.5">
                {user.role !== "superadmin" && <NotificationMenu key={user._id} />}
                <AccountMenu user={user} roleLabel={workspace.label} onLogout={onLogout} />
            </div>
        </header>
    );
}
