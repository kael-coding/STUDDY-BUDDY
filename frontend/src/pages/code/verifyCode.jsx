import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

function VerifyCode() {
    const [code, setCode] = useState(new Array(6).fill("")); // Store the code as an array of 6 digits
    const inputRefs = useRef([]); // References to the input fields
    const { user, verifyEmail, resendVerificationCode, error, isLoading } = useAuthStore();
    const navigate = useNavigate();

    // Separate loading states for both buttons
    const [isLoadingVerification, setIsLoadingVerification] = useState(false);  // For Verify Code button
    const [isResending, setIsResending] = useState(false); // For Resend button
    const [timer, setTimer] = useState(30); // Initialize with 30s cooldown (0 if no cooldown needed initially)

    // Handle change in input fields
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

    // Handle backspace
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && code[index] === "") {
            if (index > 0) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

    // Handle form submit (verify the code)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = code.join("");
        try {
            setIsLoadingVerification(true);
            await verifyEmail(verificationCode);
            toast.success("Email verified successfully!");
            navigate("/login");
        } catch (error) {
            console.error("Verification failed:", error);
            toast.error(error.message || "Verification failed. Please try again.");
        } finally {
            setIsLoadingVerification(false);
        }
    };

    // Handle resend verification code
    const handleResend = async () => {
        if (timer > 0) return; // Prevent resend if timer is still running

        try {
            setIsResending(true);
            if (!user?.email) {
                throw new Error("Email is required");
            }
            await resendVerificationCode(user.email);
            toast.success("New verification code sent!");
            setTimer(30); // Reset cooldown timer
        } catch (error) {
            console.error("Error resending verification code:", error);
            toast.error(error.message || "Failed to resend verification code.");
        } finally {
            setIsResending(false);
        }
    };

    // Countdown timer logic
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        }

        return () => clearInterval(interval); // Clean up interval on component unmount
    }, [timer]);

    // Auto-focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-4 text-black">Enter Verification Code</h2>
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
                            className="w-12 h-12 text-center text-lg border border-gray-300 text-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ))}
                </form>

                {/* Verify Code Button */}
                <button
                    type="button"
                    className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition mt-4 disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={isLoadingVerification || code.some(digit => digit === "")}
                >
                    {isLoadingVerification ? (
                        <Loader className="animate-spin mx-auto" size={24} />
                    ) : "Verify Code"}
                </button>

                {/* Resend Button with timer */}
                <div className="text-center text-sm mt-2 text-black">
                    Didn't receive the code?{" "}
                    <button
                        type="button"
                        className={`${timer > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"} bg-transparent border-none p-0`}
                        onClick={handleResend}
                        disabled={timer > 0 || isResending}
                    >
                        {timer > 0 ? (
                            `Resend in ${timer}s`
                        ) : isResending ? (
                            <Loader className="animate-spin inline" size={16} />
                        ) : (
                            "Resend"
                        )}
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mt-4 rounded-lg text-center mx-auto w-full">
                        <p className="text-sm">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyCode;