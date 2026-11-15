import User from "../models/user.model.js";

export const requireStudent = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select("role");
        if (user?.role !== "user") {
            return res.status(403).json({ success: false, message: "Student account required." });
        }
        next();
    } catch (error) {
        next(error);
    }
};
