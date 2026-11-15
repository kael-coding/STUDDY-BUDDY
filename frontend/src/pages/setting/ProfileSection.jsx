import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import AccountSummary from "@/components/setting/AccountSummary.jsx";
import AccountDetailsForm from "@/components/setting/AccountDetailsForm.jsx";
import AccountPhotoDialog from "@/components/setting/AccountPhotoDialog.jsx";
import { useAuthStore } from "@/store/authStore.js";
import SecuritySection from "./SecuritySection.jsx";

export default function ProfileSection() {
    const user = useAuthStore((state) => state.user);
    const { pathname } = useLocation();
    const [editingPhoto, setEditingPhoto] = useState(false);

    useEffect(() => {
        if (pathname !== "/setting/user/security") return;
        const frame = requestAnimationFrame(() => {
            const password = document.getElementById("settings-password");
            password?.focus({ preventScroll: true });
            password?.scrollIntoView({ block: "start" });
        });
        return () => cancelAnimationFrame(frame);
    }, [pathname]);

    return (
        <div className="mx-auto max-w-3xl space-y-5 py-4">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="mt-1 text-sm text-[#526c62]">Manage your account details and password.</p>
            </header>
            <AccountSummary user={user} showEmail>
                <div className="flex flex-wrap items-center gap-3">
                    <Link to="/profile" className="text-sm font-semibold text-[#346557] hover:underline">Open Profile</Link>
                    <button type="button" onClick={() => setEditingPhoto(true)} className="inline-flex items-center gap-2 rounded-lg border border-[#cbd9d1] px-3 py-2 text-sm font-semibold text-[#346557] hover:bg-[#e7f0ec]">
                        <Camera size={16} aria-hidden="true" /> Edit Photo
                    </button>
                </div>
            </AccountSummary>
            <AccountDetailsForm key={user._id} user={user} />
            <SecuritySection key={user._id} />
            {editingPhoto && <AccountPhotoDialog key={user._id} user={user} onClose={() => setEditingPhoto(false)} />}
        </div>
    );
}
