export function homeForRole(role) {
    if (role === "admin") return "/community/reports";
    if (role === "superadmin") return "/super-admin-dashboard";
    return "/user_dashboard";
}
