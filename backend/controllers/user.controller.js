import User from '../models/user.model.js';
import cloudinary from '../lib/cloudinary.js';
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


export const updateProfile = async (req, res) => {
    try {
        const { profilePicture } = req.body;
        const userId = req.userId

        if (!profilePicture) {
            return res.status(400).json({ success: false, message: "Profile picture is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePicture)
        const updateUser = await findByIdAndUpdate(userId, {
            profilePicture: uploadResponse.secure_url
        }, { new: true }).select("-password");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updateUser
        });
    } catch (error) {
        console.log("Controller updateProfile error", error.message);
        res.status(500).json({
            error: "Internal server error"
        });
    }
}