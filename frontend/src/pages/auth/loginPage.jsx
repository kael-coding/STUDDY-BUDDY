import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout.jsx";
import { AuthButton, AuthError, authLink } from "@/components/auth/AuthControls.jsx";
import InputField from "@/components/auth/InputField.jsx";
import { useAuthStore } from "@/store/authStore.js";
import { homeForRole } from "@/lib/homeForRole.js";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        try {
            const user = await login(email.trim(), password);
            if (user) navigate(user.isVerified ? homeForRole(user.role) : "/verify-email", { replace: true });
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not log in. Try again.");
        }
    };

    return (
        <AuthLayout title="Welcome back" subtitle="Log in to continue studying."
            footer={<>New to Study Buddy? <Link to="/signup" className={authLink}>Create Account</Link></>}>
            <form onSubmit={submit} className="space-y-4">
                <AuthError>{error}</AuthError>
                <InputField label="Email Address" name="email" type="email" autoComplete="email" required
                    placeholder="you@school.edu" value={email} onChange={(event) => setEmail(event.target.value)} />
                <InputField label="Password" name="password" type="password" autoComplete="current-password" required
                    value={password} onChange={(event) => setPassword(event.target.value)} />
                <div className="text-right text-sm">
                    <Link to="/forgot-password" className={authLink}>Forgot Password?</Link>
                </div>
                <AuthButton busy={isLoading}>{isLoading ? "Logging in…" : "Log In"}</AuthButton>
            </form>
        </AuthLayout>
    );
}
