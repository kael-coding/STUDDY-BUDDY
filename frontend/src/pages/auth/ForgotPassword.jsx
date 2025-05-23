import { useState } from "react";
import { Mail, Loader } from "lucide-react";
import InputField from "../../components/auth/InputField";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

function ForgotPassword() {
    const [formData, setFormData] = useState({
        email: "",
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isResend, setIsResend] = useState(false);
    const { forgotPassword, resendPasswordReset, isLoading } = useAuthStore();

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
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                            disabled={isResend}
                        >
                            {isResend ? <Loader className="w-6 h-6 animate-spin" /> : "Resend Reset Link"}
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
                        />
                        <button
                            type="submit"
                            className="w-full bg-[#5C8D7D] text-white py-3 rounded-lg hover:bg-[#8ab5a7] transition flex items-center justify-center"
                            disabled={isLoading}
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