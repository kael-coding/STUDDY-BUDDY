import { User } from "../models/user.model.js";
import { Note } from "../models/notes.model.js";
import { Schedule } from "../models/schedule.model.js";

export const getAllUsersWithStats = async (req, res) => {
    try {
        const { search = "" } = req.query;
        const users = await User.find({
            $or: [
                { userName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ],
        }).select("-password");

        const stats = await Promise.all(
            users.map(async (user) => {
                const taskCount = await Schedule.countDocuments({ userId: user._id });
                const noteCount = await Note.countDocuments({ userId: user._id });
                return {
                    _id: user._id,
                    userName: user.userName,
                    email: user.email,
                    isVerified: user.isVerified,
                    role: user.role,
                    taskCount,
                    noteCount,
                };
            })
        );

        res.status(200).json({ success: true, users: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
