import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcryptjs"; // Ensure this is imported

// Get user details
export const userDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });

    } catch (error) {
        console.log("Controller userDetails error", error.message);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// Update profile picture
export const updateProfilePic = async (req, res) => {
    try {
        const { profilePicture } = req.body;
        const userId = req.userId;

        if (!profilePicture) {
            return res.status(400).json({ success: false, message: "Profile picture is required" });
        }

        const fileSize = Buffer.byteLength(profilePicture.split(',')[1], 'base64');
        if (fileSize > 50 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: "File size exceeds the 50MB limit" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePicture);
        const updatedUser = await User.findByIdAndUpdate(userId, {
            profilePicture: uploadResponse.secure_url
        }, { new: true }).select("-password");

        res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.log("Controller updateProfilePic error", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update password
export const updatePassword = async (req, res) => {
    const userId = req.userId; // Updated from req.user.id to req.userId for consistency
    const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password do not match" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });

    } catch (err) {
        console.log("Controller updatePassword error", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Update profile fields (userName, course, school)
export const updateProfile = async (req, res) => {
    const userId = req.userId;
    const { userName, course, school } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (typeof userName === "string") user.userName = userName;
        if (typeof course === "string") user.course = course;
        if (typeof school === "string") user.school = school;

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            updatedProfile: {
                userName: user.userName,
                course: user.course,
                school: user.school,
            },
        });

    } catch (err) {
        console.log("Controller updateProfile error", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
