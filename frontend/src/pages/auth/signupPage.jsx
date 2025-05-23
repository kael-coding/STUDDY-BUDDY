import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import InputField from "../../components/auth/InputField";
import PasswordStrengthMeter from "../../components/auth/PasswordStrengthMeter";

function SignUpPage() {
    const [formData, setFormData] = useState({
        email: "",
        userName: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const { signup, isLoading } = useAuthStore();
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { password, confirmPassword } = formData;
            if (password !== confirmPassword) {
                return setError("Passwords do not match");
            } else {
                await signup(formData.email, formData.userName, formData.password);
                navigate("/verify-email");
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 px-4 py-6">
            <div className="bg-white p-6 md:p-8 rounded-xl md:rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 md:mb-6">
                    Create Account
                </h2>

                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                    <InputField
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        icon={<Mail size={18} className="min-w-[20px]" />}
                    />
                    <InputField
                        label="Username"
                        type="text"
                        name="userName"
                        placeholder="Choose a username"
                        value={formData.userName}
                        onChange={handleInputChange}
                        icon={<User size={18} className="min-w-[20px]" />}
                    />
                    <InputField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        icon={<Lock size={18} className="min-w-[20px]" />}
                        toggleIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        onToggle={() => setShowPassword(!showPassword)}
                    />
                    {formData.password && <PasswordStrengthMeter password={formData.password} />}

                    <InputField
                        label="Confirm Password"
                        type={showPasswordConfirm ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        icon={<Lock size={18} className="min-w-[20px]" />}
                        toggleIcon={showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        onToggle={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    />

                    {error && <p className="text-red-500 text-sm">{error.toString()}</p>}

                    <button
                        className="w-full bg-[#5C8D7D] text-white py-2 md:py-3 rounded-lg md:rounded-xl hover:bg-[#8ab5a7] transition shadow-md cursor-pointer flex justify-center items-center"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader className="animate-spin" size={20} />
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </form>

                <p className="text-center text-xs md:text-sm mt-3 text-black">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default SignUpPage;