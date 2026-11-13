import User from "../models/user.model.js";

export const isSuperAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select("role isVerified");
        if (user?.role !== "superadmin" || !user.isVerified) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        next();
    } catch (error) {
        next(error);
    }
};
