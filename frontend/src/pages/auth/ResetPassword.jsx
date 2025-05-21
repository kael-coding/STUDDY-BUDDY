import { useState } from "react";
import { Eye, EyeOff, Lock, Loader } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import InputField from "../../components/auth/InputField";
import toast from "react-hot-toast";

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "password") setPassword(value);
        if (name === "confirmPassword") setConfirmPassword(value);
    };

    const { resetPassword, isLoading, error } = useAuthStore()
    const { token } = useParams()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Password doesn't Match")
            return
        }
        try {
            await resetPassword(token, password);
            toast.success("Password reset successfully, redirect to login page...")

            setTimeout(() => {
                navigate("/login")
            }, 2000)
        } catch (error) {
            console.log("error for reset password");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-6">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset Password</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <InputField
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={password}
                        onChange={handleInputChange}
                        placeholder="Enter your new password"
                        icon={<Lock size={18} className="min-w-[20px]" />}
                        toggleIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        onToggle={() => setShowPassword(!showPassword)}
                    />
                    <InputField
                        label="Confirm New Password"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={confirmPassword}
                        placeholder="Re-enter password"
                        onChange={handleInputChange}
                        icon={<Lock size={18} className="min-w-[20px]" />}
                        toggleIcon={showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                    <button
                        className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition shadow-md"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Confirm"}
                    </button>
                </form>
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mt-4 rounded-lg text-center w-full">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <p className="text-center text-sm mt-4">
                    Back to <Link to="/login" className="text-blue-600 hover:underline cursor-pointer">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ResetPassword;