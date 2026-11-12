import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

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
    parseCookies(socket.request, {}, () => {
        let session;
        try {
            session = jwt.verify(socket.request.cookies.token, process.env.JWT_SECRET);
        } catch {
            return next(new Error("Unauthorized"));
        }

        if (typeof session?.userId !== "string" || !session.userId) {
            return next(new Error("Unauthorized"));
        }

        socket.data.userId = session.userId;
        next();
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
    await socket.join(userRoomPrefix + socket.data.userId);
    socket.on("disconnect", broadcastOnlineUsers);
    broadcastOnlineUsers();
});

export const emitToUser = (userId, event, data) => {
    io.to(userRoomPrefix + userId).emit(event, data);
};
