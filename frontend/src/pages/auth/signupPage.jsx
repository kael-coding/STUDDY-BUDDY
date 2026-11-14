import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout.jsx";
import { AuthButton, AuthError, authLink } from "@/components/auth/AuthControls.jsx";
import InputField from "@/components/auth/InputField.jsx";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter.jsx";
import TermsModal from "@/components/auth/termsAndcondition/TermsModal.jsx";
import { useAuthStore } from "@/store/authStore.js";

export default function SignUpPage() {
    const [form, setForm] = useState({ userName: "", email: "", password: "", confirmPassword: "" });
    const [agreed, setAgreed] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [error, setError] = useState("");
    const { signup, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const change = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        if (!form.userName.trim()) return setError("Enter a username.");
        if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
        if (!agreed) return setError("Please agree to the Terms and Conditions.");
        setError("");
        try {
            await signup(form.email.trim(), form.userName.trim(), form.password);
            navigate("/verify-email", { replace: true });
        } catch (requestError) {
            setError(requestError.response?.data?.message || requestError.response?.data?.error || "Could not create your account. Try again.");
        }
    };

    return (
        <AuthLayout title="Create your account" subtitle="Start organizing your study routine."
            footer={<>Already have an account? <Link to="/login" className={authLink}>Log In</Link></>}>
            <form onSubmit={submit} className="space-y-4">
                <AuthError>{error}</AuthError>
                <InputField label="Username" name="userName" autoComplete="username" required value={form.userName} onChange={change} placeholder="Choose a username" />
                <InputField label="Email Address" name="email" type="email" autoComplete="email" required value={form.email} onChange={change} placeholder="you@school.edu" />
                <InputField label="Password" name="password" type="password" autoComplete="new-password" minLength={6} required value={form.password} onChange={change} hint="At least 6 characters." />
                {form.password && <PasswordStrengthMeter password={form.password} />}
                <InputField label="Confirm Password" name="confirmPassword" type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={change} />
                <div className="flex items-start gap-2 text-sm">
                    <input id="signup-terms" type="checkbox" checked={agreed} className="mt-1 accent-[var(--landing-deep)]"
                        onChange={() => agreed ? setAgreed(false) : setShowTerms(true)} />
                    <div>
                        <label htmlFor="signup-terms">I agree to the </label>
                        <button type="button" className={authLink} onClick={() => setShowTerms(true)}>Terms and Conditions</button>
                    </div>
                </div>
                <AuthButton busy={isLoading}>{isLoading ? "Creating account…" : "Create Account"}</AuthButton>
            </form>
            <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} onAgree={() => {
                setAgreed(true);
                setError("");
            }} />
        </AuthLayout>
    );
}
