import { verifyAccessSession } from "../lib/utils/generateTokenAndSetCookie.js";

export const protectRoutes = async (req, res, next) => {
    try {
        const session = await verifyAccessSession(req.cookies.accessToken);
        if (!session) {
            return res.status(401).json({ success: false, code: "SESSION_REQUIRED", message: "Sign in to continue." });
        }

        req.userId = session.userId;
        next();
    } catch (error) {
        next(error);
    }
};
