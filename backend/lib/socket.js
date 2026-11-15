import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { verifyAccessSession } from "./utils/generateTokenAndSetCookie.js";

export const io = new Server({
    cors: {
        origin: [
            "http://localhost:5173",
            "https://studdy-buddy-production.up.railway.app",
            "https://studdy-buddy-maiin.onrender.com",
        ],
        credentials: true,
    },
});

const userRoomPrefix = "user:";
const parseCookies = cookieParser();

io.use((socket, next) => {
    parseCookies(socket.request, {}, async () => {
        try {
            const session = await verifyAccessSession(socket.request.cookies.accessToken);
            if (!session) return next(new Error("Unauthorized"));
            socket.data.userId = session.userId;
            socket.data.sessionId = session.sid;
            socket.data.expiresAt = session.exp * 1000;
            next();
        } catch {
            next(new Error("Session unavailable"));
        }
    });
});

const broadcastOnlineUsers = () => {
    const rooms = io.of("/").adapter.rooms.keys();
    const userIds = Array.from(rooms)
        .filter((room) => room.startsWith(userRoomPrefix))
        .map((room) => room.slice(userRoomPrefix.length));
    io.emit("getOnlineUsers", userIds);
};

io.on("connection", async (socket) => {
    const expiry = setTimeout(() => {
        socket.emit("sessionExpired");
        socket.disconnect(true);
    }, Math.max(0, socket.data.expiresAt - Date.now()));
    socket.on("disconnect", () => {
        clearTimeout(expiry);
        broadcastOnlineUsers();
    });
    await socket.join([userRoomPrefix + socket.data.userId, "session:" + socket.data.sessionId]);
    broadcastOnlineUsers();
});

export const disconnectAuthSession = (id) => io.in("session:" + id).disconnectSockets(true);
export const disconnectUserSessions = (userId) => io.in(userRoomPrefix + userId).disconnectSockets(true);

export const emitToUser = (userId, event, data) => {
    io.to(userRoomPrefix + userId).emit(event, data);
};
