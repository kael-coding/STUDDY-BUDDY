import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import AuthSession from "../../models/authSession.model.js";
import User from "../../models/user.model.js";

const accessMs = 15 * 60_000;
const refreshMs = 7 * 24 * 60 * 60_000;
const refreshPath = "/api/auth";
const cookieOptions = () => ({
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
});

export const newRefreshToken = () => randomBytes(32).toString("hex");
export const hashRefreshToken = (token) => createHash("sha256").update(token).digest("hex");
export const validRefreshToken = (token) => typeof token === "string" && /^[a-f0-9]{64}$/.test(token);

export function setSessionCookies(res, session, refreshToken) {
    const maxAge = Math.max(0, session.expiresAt.getTime() - Date.now());
    const seconds = Math.floor(Math.min(maxAge, accessMs) / 1000);
    const accessToken = jwt.sign({ userId: session.userId, sid: String(session._id) }, process.env.JWT_SECRET, {
        algorithm: "HS256", expiresIn: seconds,
    });
    const options = cookieOptions();
    res.cookie("accessToken", accessToken, { ...options, maxAge: seconds * 1000 });
    res.cookie("refreshToken", refreshToken, { ...options, path: refreshPath, maxAge });
}

export async function generateTokenAndSetCookie(res, user) {
    const refreshToken = newRefreshToken();
    const session = await AuthSession.create({
        userId: user._id,
        version: user.sessionVersion ?? 0,
        refreshHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshMs),
    });
    setSessionCookies(res, session, refreshToken);
}

export function clearSessionCookies(res) {
    const options = cookieOptions();
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", { ...options, path: refreshPath });
}

export function decodeAccessToken(token, ignoreExpiration = false) {
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"], ignoreExpiration });
        return typeof payload?.userId === "string" && mongoose.isObjectIdOrHexString(payload.sid) ? payload : null;
    } catch {
        return null;
    }
}

export async function verifyAccessSession(token) {
    const payload = decodeAccessToken(token);
    if (!payload) return null;
    const [session, user] = await Promise.all([
        AuthSession.findOne({ _id: payload.sid, userId: payload.userId, expiresAt: { $gt: new Date() } }).select("version").lean(),
        User.findById(payload.userId).select("sessionVersion").lean(),
    ]);
    return user && session && session.version === (user.sessionVersion ?? 0) ? payload : null;
}
