export function homeForRole(role) {
    if (role === "admin") return "/admin-dashboard";
    return "/user_dashboard";
}
