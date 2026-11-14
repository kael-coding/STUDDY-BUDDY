import { useState } from "react";
import { KeyRound, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore.js";
import { useUserStore } from "@/store/userStore.js";
import { AdminHeading } from "./components/AdminPanels.jsx";

const fields = [
    ["current", "Current password"],
    ["next", "New password"],
    ["confirm", "Confirm new password"],
];

export default function AdminSettings() {
    const user = useAuthStore((state) => state.user);
    const { updatePassword, isLoading } = useUserStore();
    const [error, setError] = useState("");

    const submit = async (event) => {
        event.preventDefault();
        if (isLoading) return;
        const form = new FormData(event.currentTarget);
        const next = form.get("next");
        const confirm = form.get("confirm");
        if (next !== confirm) {
            setError("New passwords don't match.");
            return;
        }
        setError("");
        const result = await updatePassword(form.get("current"), next, confirm);
        if (!result.success) {
            setError(result.error || "Could not change your password.");
            return;
        }
        toast.success("Password changed. Sign in with your new password.");
        useAuthStore.getState().clearSession();
    };

    return (
        <div className="mx-auto max-w-6xl space-y-5 py-4">
            <AdminHeading title="Settings" description="Manage your administrator account and password." />
            <div className="max-w-3xl space-y-5">
                <section className="overflow-hidden rounded-xl border border-[#dce7e1] bg-white">
                    <div className="h-16 bg-[#467467]" aria-hidden="true" />
                    <div className="flex flex-wrap items-end justify-between gap-3 px-5 pb-5">
                        <div className="min-w-0">
                            <div className="relative -mt-5 grid size-12 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#e7f0ec] text-[#346557]">
                                {user.profilePicture ? <img src={user.profilePicture} alt="" className="size-full object-cover" /> : <UserRound size={22} aria-hidden="true" />}
                            </div>
                            <h2 className="mt-2 font-semibold [overflow-wrap:anywhere]">{user.userName}</h2>
                            <p className="text-sm text-[#526c62] [overflow-wrap:anywhere]">{user.email}</p>
                            <p className="mt-1 text-xs font-medium text-[#346557]">{user.role === "admin" ? "Community Admin" : "Super Admin"}</p>
                        </div>
                        <Link to="/profile" className="text-sm font-semibold text-[#346557] hover:underline">Open profile</Link>
                    </div>
                </section>
                <form onSubmit={submit} className="space-y-4 rounded-xl border border-[#dce7e1] bg-white p-5" aria-labelledby="admin-password-title">
                    <h2 id="admin-password-title" className="flex items-center gap-2 font-semibold"><KeyRound size={17} aria-hidden="true" /> Change password</h2>
                    {fields.map(([name, label]) => (
                        <label key={name} className="block text-sm font-medium">{label}
                            <input name={name} type="password" autoComplete={name === "current" ? "current-password" : "new-password"}
                                required minLength={name === "current" ? undefined : 8} disabled={isLoading}
                                className="mt-1 block w-full max-w-sm rounded-lg border border-[#cbd9d1] px-3 py-2" />
                        </label>
                    ))}
                    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                    <button type="submit" disabled={isLoading} className="rounded-lg bg-[#346557] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {isLoading ? "Saving…" : "Change password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
