import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore.js";
import { useUserStore } from "@/store/userStore.js";

const fields = [
    ["current", "Current password"],
    ["next", "New password"],
    ["confirm", "Confirm new password"],
];

export default function SecuritySection() {
    const { updatePassword, isLoading } = useUserStore();
    const [error, setError] = useState("");
    const [visible, setVisible] = useState({});

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
        const userId = useAuthStore.getState().user?._id;
        setError("");
        const result = await updatePassword(form.get("current"), next, confirm);
        if (!result.success) {
            setError(result.error || "Could not change your password.");
            return;
        }
        if (useAuthStore.getState().user?._id === userId) {
            toast.success("Password changed. Sign in with your new password.");
            useAuthStore.getState().clearSession();
        }
    };

    return (
        <form id="settings-password" tabIndex={-1} onSubmit={submit} aria-labelledby="settings-password-title"
            className="space-y-4 rounded-xl border border-[#dce7e1] bg-white p-5">
            <h2 id="settings-password-title" className="flex items-center gap-2 font-semibold"><KeyRound size={17} aria-hidden="true" /> Change Password</h2>
            {fields.map(([name, label]) => (
                <div key={name} className="max-w-sm">
                    <label htmlFor={`password-${name}`} className="block text-sm font-medium">{label}</label>
                    <div className="relative mt-1">
                        <input id={`password-${name}`} name={name} type={visible[name] ? "text" : "password"} autoComplete={name === "current" ? "current-password" : "new-password"}
                            required minLength={name === "current" ? undefined : 8} disabled={isLoading}
                            className="block w-full rounded-lg border border-[#cbd9d1] px-3 py-2 pr-10" />
                        <button type="button" aria-label={`${visible[name] ? "Hide" : "Show"} ${label.toLowerCase()}`}
                            onClick={() => setVisible((current) => ({ ...current, [name]: !current[name] }))}
                            className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-lg text-[#526c62] hover:bg-[#e7f0ec]">
                            {visible[name] ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                        </button>
                    </div>
                </div>
            ))}
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={isLoading} className="rounded-lg bg-[#346557] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294f43] disabled:opacity-50">Change Password</button>
        </form>
    );
}
