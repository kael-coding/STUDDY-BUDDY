import { useState, useEffect } from "react";
import { Mail, Loader } from "lucide-react";
import InputField from "../../components/auth/InputField";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

function ForgotPassword() {
    const [formData, setFormData] = useState({
        email: "",
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isResend, setIsResend] = useState(false);
    const [timer, setTimer] = useState(0); // Cooldown timer
    const { forgotPassword, resendPasswordReset, isLoading } = useAuthStore();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await forgotPassword(formData.email);
            setIsSubmitted(true);
            setTimer(30); // Start cooldown after first submission
        } catch (error) {
            console.error("Forgot password error:", error);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return; // Prevent resend during cooldown

        try {
            setIsResend(true);
            const success = await resendPasswordReset(formData.email);
            if (success) {
                setTimer(30); // Reset cooldown on successful resend
            }
        } catch (error) {
            console.error("Resend error:", error);
        } finally {
            setIsResend(false);
        }
    };

    // Timer countdown effect
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-6">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Forgot Password</h2>

                {isSubmitted ? (
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            If an account exists for <span className="font-semibold">{formData.email}</span>, you will receive a password reset link shortly.
                        </p>
                        <button
                            onClick={handleResend}
                            className={`w-full ${timer > 0 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-lg transition flex items-center justify-center`}
                            disabled={timer > 0 || isResend}
                        >
                            {isResend ? (
                                <Loader className="w-6 h-6 animate-spin" />
                            ) : timer > 0 ? (
                                `Resend in ${timer}s`
                            ) : (
                                "Resend Reset Link"
                            )}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InputField
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            icon={<Mail size={18} className="min-w-[20px]" />}
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-[#5C8D7D] text-white py-3 rounded-lg hover:bg-[#8ab5a7] transition flex items-center justify-center"
                            disabled={isLoading || !formData.email}
                        >
                            {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <p className="text-center text-sm mt-4 text-black">
                    Remember your password?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;