import User from "../models/user.model.js";

export async function requireAdmin(req, res, next) {
    try {
        const user = await User.findById(req.userId).select("role isVerified");
        if (user?.role !== "admin" || !user.isVerified) {
            return res.status(403).json({ message: "Admin access required." });
        }
        next();
    } catch (error) {
        next(error);
    }
}
