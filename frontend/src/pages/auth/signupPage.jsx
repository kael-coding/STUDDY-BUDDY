import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Loader } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

import InputField from "../../components/auth/InputField.jsx";
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

    const { signup, isLoading, } = useAuthStore();
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
            throw error;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-[430px]">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Account</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        icon={<Mail size={20} />}
                    />
                    <InputField
                        label="Username"
                        type="text"
                        name="userName"
                        placeholder="Choose a username"
                        value={formData.userName}
                        onChange={handleInputChange}
                        icon={<User size={20} />}
                    />
                    <InputField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        icon={<Lock size={20} />}
                        toggleIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                        icon={<Lock size={20} />}
                        toggleIcon={showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        onToggle={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    />
                    {error && <p className="text-red-500 text-sm">{error.toString()}</p>}
                    <button className="w-full bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition shadow-md cursor-pointer" type="submit" disabled={isLoading}>
                        {isLoading ? <Loader className="animate-spin mx-auto" size={24} /> : 'Sign Up'}
                    </button>
                </form>
                <p className="text-center text-sm mt-3">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline cursor-pointer">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default SignUpPage;
