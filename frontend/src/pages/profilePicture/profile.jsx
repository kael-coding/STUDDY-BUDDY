import { PencilLine } from "lucide-react";
import { Link } from "react-router-dom";
import AccountSummary from "@/components/setting/AccountSummary.jsx";
import ProfileActivity from "@/components/setting/ProfileActivity.jsx";
import { useAuthStore } from "@/store/authStore.js";

export default function Profile() {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="mx-auto max-w-3xl space-y-5 py-4">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <AccountSummary user={user}>
                <Link to="/setting/user/profile" className="inline-flex items-center gap-2 rounded-lg border border-[#cbd9d1] px-3 py-2 text-sm font-semibold text-[#346557] hover:bg-[#e7f0ec]">
                    <PencilLine size={16} aria-hidden="true" /> Edit Info
                </Link>
            </AccountSummary>
            <ProfileActivity key={user._id} />
        </div>
    );
}
