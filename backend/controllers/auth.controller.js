import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie.js";
import { sendPasswordResetResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../middleware/nodemailer/email.js";

export const signup = async (req, res) => {
    const { email, userName, password, role } = req.body;
    try {
        if (!email || !userName || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();


        let customId;
        let isUnique = false;

        while (!isUnique) {
            const randomNum = Math.floor(10000 + Math.random() * 90000); // Generate a 5-digit number
            customId = `67890${randomNum}`;
            const existingUser = await User.findOne({ _id: customId });
            if (!existingUser) {
                isUnique = true;
            }
        }

        const user = new User({
            _id: customId,
            email,
            userName,
            password: hashedPassword,
            role: role || "user",
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });

        await user.save();
        generateTokenAndSetCookie(res, user._id);
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User Successfully created",
            user: {
                ...user._doc,
                password: undefined,
            }
        });

    } catch (error) {
        console.log("Controller Signup error", error.message);
        res.status(500).json({
            error: "Internal server error"
        });
    }
};

export const verifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.userName);

        // Clear the cookie after verification
        res.cookie("token", "", { maxAge: 0 });

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Email verification failed"
        });
        //console.log(error.message);
    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ success: false, message: "Invalid email" });

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) return res.status(400).json({ success: false, message: "Invalid password" });

        generateTokenAndSetCookie(res, user._id);

        user.lastlogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Login Successfully",
            user: {
                ...user._doc,
                password: undefined
            },
        });
    } catch (error) {
        console.log("erorr  in login " + error)
        res.status(400).json({ success: false, message: error.message });
    }

}
export const logout = async (req, res) => {
    try {
        res.cookie("token", "", { maxAge: 0 })
        res.status(200).json({
            message: "Logged out successfully"
        })
    } catch (error) {
        console.log("Controller logout error", error.message,);
        res.status(500).json({
            error: "Internal server error"
        })
    }
}
export const forgotpassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        const resetToken = crypto.randomBytes(20).toString("hex")
        const resetTokenExpireAt = Date.now() + 1 * 60 * 60 * 1000; // hour1 expired

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpireAt

        await user.save()

        //send email section
        await sendPasswordResetResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`, user.userName,)

        res.status(200).json({ success: true, message: "Password reset Link sent to your email" })
    } catch (error) {
        console.log("Error for the forgotpassword", error)
        res.status(400).json({ success: false, message: error.message })
    }

}

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        user.save();


        await sendResetSuccessEmail(user.email);
        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.log("Errro for the resetPasswrod", error)
        res.status(500).json({ success: false, message: error.message });
    }
}

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true, user
        });
    } catch (error) {
        console.log("Controller checkAuth error", error.message);
        res.status(500).json({
            error: "Internal server error"
        });
    }
}
export const resendVerificationCode = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "Email is already verified" });
        }

        // Generate new 6-digit verification token
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationToken = verificationToken;
        user.verificationTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

        await user.save();

        // Send email with new token
        await sendVerificationEmail(user.email, verificationToken);

        res.status(200).json({
            success: true,
            message: "A new verification code has been sent to your email",
        });
    } catch (error) {
        console.log("Error in resendVerificationCode:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
