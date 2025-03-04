import { useState } from "react";
import { Mail } from "lucide-react";
import InputField from "../../components/auth/InputField";
import { Link } from "react-router-dom";


function ForgotPassword() {
    const [formData, setFormData] = useState({
        email: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        e.preventDefault();
    };

    const onChangeType = (type) => {
        console.log(`Change to ${type} type`);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg w-[430px]">
                <h2 className="text-2xl font-bold text-center mb-4">Forgot Password</h2>
                <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    icon={<Mail size={20} />}
                />
                <button className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition mt-4">
                    Send Reset Link
                </button>
                <p className="text-center text-sm mt-3">
                    You remember the password? <Link to="/login" className="text-blue-600 hover:underline cursor-pointer">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;