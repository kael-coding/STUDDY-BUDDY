import { useState } from "react";
import { Mail, Loader } from "lucide-react";
import InputField from "../../components/auth/InputField.jsx";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

function ForgotPassword() {
    const [formData, setFormData] = useState({
        email: "",
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isResend, setIsResend] = useState(false);  // Track resend state
    const { forgotPassword, resendPasswordReset, isLoading } = useAuthStore();  // Added resendPasswordReset

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        e.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await forgotPassword(formData.email);
        setIsSubmitted(true);
    };

    const handleResend = async () => {
        setIsResend(true);
        await resendPasswordReset(formData.email);
        setIsResend(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg w-[430px]">
                <h2 className="text-2xl text-black font-bold text-center mb-4">Forgot Password</h2>

                {isSubmitted ? (
                    <p className="text-gray-600">
                        If an account exists for <span className="font-semibold">{formData.email}</span>, you will receive a password reset link shortly.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <div className="relative mt-1">
                            <InputField
                                label="Email"
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                icon={<Mail size={20} />}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : "Send Reset Link"}
                        </button>
                    </form>
                )}

                {/* Resend Password Reset Button */}
                {isSubmitted && !isResend && (
                    <div className="mt-4">
                        <button
                            onClick={handleResend}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                            disabled={isResend}
                        >
                            {isResend ? <Loader className="w-6 h-6 animate-spin" /> : "Resend Reset Link"}
                        </button>
                    </div>
                )}

                {/* Footer Links */}
                <p className="text-sm mt-4 text-black">
                    Remember your password?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
