import AuthSession from "../models/authSession.model.js";
import User from "../models/user.model.js";
import {
    decodeAccessToken, hashRefreshToken, newRefreshToken,
    setSessionCookies, validRefreshToken,
} from "../lib/utils/generateTokenAndSetCookie.js";
import { disconnectAuthSession } from "../lib/socket.js";

export async function refreshSession(req, res, next) {
    res.set("Cache-Control", "no-store");
    const token = req.cookies.refreshToken;
    const unauthorized = (code = "REFRESH_INVALID") =>
        res.status(401).json({ code, message: "Session expired. Sign in again." });
    if (!token) return unauthorized("REFRESH_MISSING");
    if (!validRefreshToken(token)) return unauthorized();

    try {
        const filter = { refreshHash: hashRefreshToken(token), expiresAt: { $gt: new Date() } };
        const session = await AuthSession.findOne(filter).lean();
        if (!session) return unauthorized();
        const user = await User.findById(session.userId).select("sessionVersion").lean();
        if (!user || (user.sessionVersion ?? 0) !== session.version) return unauthorized();

        const replacement = newRefreshToken();
        const result = await AuthSession.updateOne({ _id: session._id, ...filter }, {
            $set: { refreshHash: hashRefreshToken(replacement) },
        });
        if (!result.matchedCount) return unauthorized();

        setSessionCookies(res, session, replacement);
        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
}

export async function revokeCurrentSession(req) {
    const access = decodeAccessToken(req.cookies.accessToken, true);
    const refresh = req.cookies.refreshToken;
    const filters = [];
    if (access) filters.push({ _id: access.sid, userId: access.userId });
    if (validRefreshToken(refresh)) filters.push({ refreshHash: hashRefreshToken(refresh) });
    if (filters.length) {
        const session = await AuthSession.findOneAndDelete({ $or: filters }).select("_id");
        if (session) disconnectAuthSession(String(session._id));
    }
}
