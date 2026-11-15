import { useState } from "react";
import { IdCard } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore.js";
import { useUserStore } from "@/store/userStore.js";

const field = "mt-1 block w-full rounded-lg border border-[#cbd9d1] px-3 py-2";

export default function AccountDetailsForm({ user }) {
    const { updateProfile, isLoading } = useUserStore();
    const [error, setError] = useState("");
    const student = user.role === "user";

    const save = async (event) => {
        event.preventDefault();
        if (isLoading) return;
        const form = new FormData(event.currentTarget);
        const name = form.get("userName").trim();
        if (!name) {
            setError("Enter your username.");
            return;
        }
        setError("");
        const result = await updateProfile(name, form.get("course")?.trim(), form.get("school")?.trim());
        if (!result.success) {
            setError(result.error);
            return;
        }
        useAuthStore.setState((state) => state.user?._id === user._id
            ? { user: { ...state.user, ...result.user } } : state);
        toast.success("Profile updated.");
    };

    return (
        <form onSubmit={save} aria-labelledby="personal-info-title" className="space-y-4 rounded-xl border border-[#dce7e1] bg-white p-5">
            <h2 id="personal-info-title" className="flex items-center gap-2 font-semibold"><IdCard size={18} aria-hidden="true" /> Personal Info</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">Username
                    <input name="userName" autoComplete="username" defaultValue={user.userName} required disabled={isLoading} className={field} />
                </label>
                <label className="block text-sm font-medium">Email
                    <input type="email" readOnly value={user.email} className={field + " bg-[#f4f8f6] text-[#526c62]"} />
                </label>
                {student && <>
                    <label className="block text-sm font-medium">School
                        <input name="school" defaultValue={user.school ?? ""} disabled={isLoading} className={field} />
                    </label>
                    <label className="block text-sm font-medium">Major / Course
                        <input name="course" defaultValue={user.course ?? ""} disabled={isLoading} className={field} />
                    </label>
                </>}
            </div>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={isLoading} className="rounded-lg bg-[#346557] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294f43] disabled:opacity-50">Save Info</button>
        </form>
    );
}
