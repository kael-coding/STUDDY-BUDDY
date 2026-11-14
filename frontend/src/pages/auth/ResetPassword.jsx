import { useState } from "react";
import { Check } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout.jsx";
import { AuthButton, AuthError, authLink } from "@/components/auth/AuthControls.jsx";
import InputField from "@/components/auth/InputField.jsx";
import { useAuthStore } from "@/store/authStore.js";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const { resetPassword, isLoading } = useAuthStore();
    const { token } = useParams();

    const submit = async (event) => {
        event.preventDefault();
        if (password !== confirmation) return setError("Passwords do not match.");
        setError("");
        try {
            await resetPassword(token, password);
            setDone(true);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not reset your password. Try again.");
        }
    };

    return (
        <AuthLayout title="Reset password" subtitle="Choose a new password for your account."
            footer={<Link to="/login" className={authLink}>{done ? "Log In" : "Back to Log In"}</Link>}>
            {done ? (
                <div role="status" className="space-y-2 text-center">
                    <div className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--landing-mint)] text-[var(--landing-deep)]">
                        <Check size={20} aria-hidden="true" />
                    </div>
                    <h2 className="font-semibold">Password updated</h2>
                    <p className="text-sm text-[var(--landing-muted)]">You can now log in with your new password.</p>
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <AuthError>{error}</AuthError>
                    <InputField label="New Password" name="password" type="password" autoComplete="new-password" minLength={6} required hint="At least 6 characters."
                        value={password} onChange={(event) => setPassword(event.target.value)} />
                    <InputField label="Confirm New Password" name="confirmPassword" type="password" autoComplete="new-password" required
                        value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
                    <AuthButton busy={isLoading}>{isLoading ? "Resetting…" : "Reset Password"}</AuthButton>
                    {error && <Link to="/forgot-password" className={`block text-center text-sm ${authLink}`}>Request a new reset link</Link>}
                </form>
            )}
        </AuthLayout>
    );
}
