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
    const [timer, setTimer] = useState(0); // For cooldown timer

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
        const verificationCode = code.join(""); // Join the code array into a single string
        try {
            setIsLoadingVerification(true); // Set loading state for verify button
            await verifyEmail(verificationCode);
            navigate("/login"); // Redirect to login after successful verification
        } catch (error) {
            console.error("Verification failed:", error);
        } finally {
            setIsLoadingVerification(false); // Reset the loading state after the request
        }
    };

    // Handle resend verification code
    const handleResend = async () => {
        try {
            setIsResending(true); // Set loading state for resend button
            if (!user?.email) {
                throw new Error("Email is required");
            }
            await resendVerificationCode(user.email);
            toast.success("Verification code resent successfully!");

            // Start 30-second timer after successful resend
            setTimer(30);
        } catch (error) {
            console.error("Error resending verification code:", error);
            toast.error(error.message || "An error occurred while resending the verification code.");
        } finally {
            setIsResending(false); // Reset loading state after resend
        }
    };

    // Countdown timer logic
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }

        return () => clearInterval(interval); // Clean up interval on component unmount
    }, [timer]);

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

                {/* Verify Code Button */}
                <button
                    className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition mt-4"
                    onClick={handleSubmit}
                    disabled={isLoadingVerification} // Disable when loading (for verification)
                >
                    {isLoadingVerification ? <Loader className="animate-spin mx-auto" size={24} /> : "Verify Code"}
                </button>

                {/* Resend Button with timer */}
                <p className="text-center text-sm mt-2">
                    Didn't receive the code?{" "}
                    <span
                        className={`text-blue-600 hover:underline cursor-pointer ${timer > 0 ? "cursor-not-allowed text-gray-400" : ""}`}
                        onClick={handleResend}
                        disabled={timer > 0 || isResending} // Disable resend while resending or timer is running
                    >
                        {timer > 0 ? `Resend in ${timer}s` : isResending ? <Loader className="animate-spin mx-auto" size={24} /> : "Resend"}
                    </span>
                </p>

                {/* Error Message */}
                {error && <p className="text-red-500 text-sm mt-3">{error.toString()}</p>}
            </div>
        </div>
    );
}

export default VerifyCode;
