import { useState, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";

function VerifyCode() {
    const [code, setCode] = useState(new Array(6).fill(""));
    const inputRefs = useRef([]);
    const { verifyEmail, error, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (value.match(/^[0-9]$/)) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            // Move to the next input
            if (index < inputRefs.current.length - 1) {
                inputRefs.current[index + 1].focus();
            }
        } else if (value === "") {
            const newCode = [...code];
            newCode[index] = "";
            setCode(newCode);
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && code[index] === "") {
            if (index > 0) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = code.join("");
        try {
            await verifyEmail(verificationCode);
            navigate("/login");
        } catch (error) {
            throw error;
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-4">Enter Verification Code</h2>
                <p className="text-center text-gray-600 mb-4">
                    We've sent a verification code to your email. Please enter it below.
                </p>
                <form onSubmit={handleSubmit} className="flex justify-center gap-2">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-12 h-12 text-center text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ))}
                </form>
                <button
                    className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition mt-4"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader className="animate-spin mx-auto" size={24} /> : "Verify Code"}
                </button>
                <p className="text-center text-sm mt-2">
                    Didn't receive the code? <span className="text-blue-600 hover:underline">Resend</span>
                </p>
                {error && <p className="text-red-500 text-sm mt-3">{error.toString()}</p>}
            </div>
        </div>
    );
}

export default VerifyCode;
