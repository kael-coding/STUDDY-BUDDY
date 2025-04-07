import { User } from "../models/user.model.js";

export const isSuperAdmin = async (req, res, next) => {
    const user = await User.findById(req.userId);
    if (user?.role !== "superadmin") {
        return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
};