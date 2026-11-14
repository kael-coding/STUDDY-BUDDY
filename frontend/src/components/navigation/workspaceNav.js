import {
    Archive, Bell, BookOpen, CalendarDays, ChartNoAxesColumn, ClipboardList,
    Files, House, MessageSquare, Radar, Settings, Timer, Trash2, UserRound, Users,
} from "lucide-react";

const dashboard = { to: "/user_dashboard", label: "Dashboard", Icon: House };
const groups = { to: "/community", label: "Study Groups", Icon: Users };
const messages = { to: "/messages", label: "Messages", Icon: MessageSquare };
const notifications = { to: "/notifications", label: "Notifications", Icon: Bell };
const profile = { to: "/profile", label: "Profile", Icon: UserRound };
const settings = { to: "/setting/user/profile", label: "Settings", Icon: Settings };
const reports = { to: "/community/reports", label: "Community Reports", Icon: ClipboardList };
const superDashboard = { to: "/super-admin-dashboard", label: "Super Admin Dashboard", Icon: House };
const userManagement = { to: "/user_management", label: "User Management", Icon: Users };
const adminReports = { to: "/admin_reports", label: "Admin Reports", Icon: ClipboardList };
const account = { title: "Account", items: [profile, settings] };

export const workspaces = {
    user: {
        label: "Student",
        subtitle: "Student Workspace",
        sections: [
            { title: "Main workspace", items: [
                dashboard,
                { to: "/user_dashboard#review-radar-title", label: "Review Radar", Icon: Radar },
                { to: "/task-scheduler", label: "Study Planner", Icon: CalendarDays },
                { to: "/digital-notebook", label: "Study Library", Icon: BookOpen },
                { to: "/flashcard-review", label: "Flashcard Review", Icon: Files, badge: "flagged" },
                { to: "/focus-session", label: "Focus Session", Icon: Timer },
                { to: "/study-progress", label: "Study Progress", Icon: ChartNoAxesColumn },
            ] },
            { title: "Community", items: [groups, messages] },
            { title: "Quick access", items: [
                notifications,
                { to: "/archive", label: "Archive", Icon: Archive },
                { to: "/trash", label: "Trash", Icon: Trash2 },
            ] },
            account,
        ],
    },
    admin: {
        label: "Community Admin",
        subtitle: "Community Administration",
        sections: [
            { title: "Moderation", items: [reports, groups, messages, notifications] },
            account,
        ],
    },
    superadmin: {
        label: "Super Admin",
        subtitle: "System Administration",
        sections: [
            { title: "Administration", items: [superDashboard, userManagement, adminReports] },
            account,
        ],
    },
};

export function matchesWorkspaceLink(to, pathname, hash) {
    if (to === settings.to && pathname === "/setting/user/security") return true;
    if (to === dashboard.to || to.includes("#")) return to === pathname + hash;
    return to === pathname;
}

export function workspacePageTitle(workspace, pathname, hash) {
    const items = workspace.sections.flatMap((section) => section.items);
    return items.find(({ to }) => matchesWorkspaceLink(to, pathname, hash))?.label
        ?? items.find(({ to }) => to === pathname)?.label
        ?? [groups, messages, notifications].find(({ to }) => to === pathname)?.label
        ?? "Study Buddy";
}
