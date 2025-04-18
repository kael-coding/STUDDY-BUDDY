import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

const app = express();
// TODO NEED TO REMOVE THE DEBUG
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://studdy-buddy-maiin-production.up.railway.app",
        "https://studdy-buddy-maiin.onrender.com"
    ],
    credentials: true,
}));

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://studdy-buddy-maiin-production.up.railway.app",
            "https://studdy-buddy-maiin.onrender.com"
        ],
        credentials: true,
    }
});

const userSocketMap = {};

io.on("connection", (socket) => {
    console.log(" A user connected", socket.id);

    const userId = socket.handshake.auth?.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(" Registered userId:", userId);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log(" User disconnected", socket.id);

        // remove user from userSocketMap by matching socket.id
        const disconnectedUserId = Object.keys(userSocketMap).find(
            key => userSocketMap[key] === socket.id
        );

        if (disconnectedUserId) {
            delete userSocketMap[disconnectedUserId];
            console.log(" Removed userId:", disconnectedUserId);
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };
