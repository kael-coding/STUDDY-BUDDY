import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout.jsx";
import { AuthButton, AuthError, authLink } from "@/components/auth/AuthControls.jsx";
import InputField from "@/components/auth/InputField.jsx";
import { useAuthStore } from "@/store/authStore.js";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [submittedEmail, setSubmittedEmail] = useState("");
    const [remaining, setRemaining] = useState(0);
    const [error, setError] = useState("");
    const { forgotPassword, resendPasswordReset, isLoading } = useAuthStore();
    const coolingDown = remaining > 0;

    useEffect(() => {
        if (!coolingDown) return;
        const timer = setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
        return () => clearInterval(timer);
    }, [coolingDown]);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        const address = email.trim();
        try {
            await forgotPassword(address);
            setSubmittedEmail(address);
            setRemaining(30);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not request a reset link. Try again.");
        }
    };

    const resend = async () => {
        if (await resendPasswordReset(submittedEmail)) setRemaining(30);
    };

    return (
        <AuthLayout title="Forgot password" subtitle="We’ll send instructions to reset your password."
            footer={<Link to="/login" className={authLink}>Back to Log In</Link>}>
            {submittedEmail ? (
                <div className="space-y-4 text-center">
                    <div className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--landing-mint)] text-[var(--landing-deep)]">
                        <Mail size={20} aria-hidden="true" />
                    </div>
                    <div role="status">
                        <h2 className="font-semibold">Check your inbox</h2>
                        <p className="mt-1 break-words text-sm text-[var(--landing-muted)]">
                            If an account exists for {submittedEmail}, follow the reset link in your email.
                        </p>
                    </div>
                    <AuthButton type="button" secondary busy={isLoading} disabled={coolingDown} onClick={resend}>
                        {isLoading ? "Sending…" : coolingDown ? `Resend in ${remaining}s` : "Resend Reset Link"}
                    </AuthButton>
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <AuthError>{error}</AuthError>
                    <InputField label="Email Address" name="email" type="email" autoComplete="email" required
                        placeholder="you@school.edu" value={email} onChange={(event) => setEmail(event.target.value)} />
                    <AuthButton busy={isLoading}>{isLoading ? "Sending…" : "Send Recovery Instructions"}</AuthButton>
                </form>
            )}
        </AuthLayout>
    );
}
