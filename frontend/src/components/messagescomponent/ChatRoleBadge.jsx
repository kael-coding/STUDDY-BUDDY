export default function ChatRoleBadge({ role }) {
    if (role !== "admin") return null;
    return <span className="shrink-0 rounded-md bg-[#dcece4] px-1.5 py-0.5 text-[10px] font-semibold text-[#294f43]">Admin</span>;
}
