import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "@/components/auth/AuthLayout.jsx";
import { AuthButton, AuthError, authLink } from "@/components/auth/AuthControls.jsx";
import { useAuthStore } from "@/store/authStore.js";

export default function VerifyCode() {
    const [code, setCode] = useState(() => Array(6).fill(""));
    const [remaining, setRemaining] = useState(30);
    const [error, setError] = useState("");
    const inputs = useRef([]);
    const { user, verifyEmail, resendVerificationCode, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const coolingDown = remaining > 0;

    useEffect(() => {
        if (!coolingDown) return;
        const timer = setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
        return () => clearInterval(timer);
    }, [coolingDown]);

    const enterDigits = (value, index) => {
        const digits = value.replace(/[^0-9]/g, "").slice(0, 6 - index);
        setError("");
        setCode((previous) => {
            const next = [...previous];
            if (!digits) next[index] = "";
            else [...digits].forEach((digit, offset) => { next[index + offset] = digit; });
            return next;
        });
        if (digits) inputs.current[Math.min(index + digits.length, 5)]?.focus();
    };

    const submit = async (event) => {
        event.preventDefault();
        if (code.some((digit) => !digit)) return;
        setError("");
        try {
            await verifyEmail(code.join(""));
            toast.success("Email verified. You can now log in.");
            navigate("/login", { replace: true });
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not verify your email. Try again.");
        }
    };

    const resend = async () => {
        setError("");
        if (await resendVerificationCode(user.email)) setRemaining(30);
    };

    return (
        <AuthLayout title="Verify your email"
            subtitle={user?.email ? `Enter the 6-digit code sent to ${user.email}.` : "Sign in to continue verifying your account."}
            footer={<Link to="/login" className={authLink}>Back to Log In</Link>}>
            {user?.email ? (
                <form onSubmit={submit} className="space-y-4">
                    <AuthError>{error}</AuthError>
                    <div className="grid grid-cols-6 gap-1.5 sm:gap-2" role="group" aria-label="Verification code">
                        {code.map((digit, index) => (
                            <input key={index} ref={(input) => { inputs.current[index] = input; }}
                                aria-label={`Digit ${index + 1}`} inputMode="numeric" value={digit}
                                autoComplete={index === 0 ? "one-time-code" : "off"}
                                disabled={isLoading}
                                onChange={(event) => enterDigits(event.target.value, index)}
                                onPaste={(event) => {
                                    event.preventDefault();
                                    enterDigits(event.clipboardData.getData("text"), index);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Backspace" && !digit && index > 0) inputs.current[index - 1]?.focus();
                                }}
                                className="h-12 min-w-0 rounded-lg border border-[var(--landing-line)] text-center text-lg font-semibold" />
                        ))}
                    </div>
                    <AuthButton busy={isLoading} disabled={code.some((digit) => !digit)}>Verify</AuthButton>
                    <div className="text-center text-sm text-[var(--landing-muted)]">
                        Didn’t get a code?{" "}
                        <button type="button" disabled={coolingDown || isLoading} onClick={resend} className={authLink + " disabled:opacity-55"}>
                            {coolingDown ? `Resend in ${remaining}s` : "Resend Code"}
                        </button>
                    </div>
                </form>
            ) : <p className="text-sm">Use the email address from your signup to continue.</p>}
        </AuthLayout>
    );
}
