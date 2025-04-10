import User from '../models/user.model.js';
import cloudinary from '../lib/cloudinary.js';



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