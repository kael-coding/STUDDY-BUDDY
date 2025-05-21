import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

// Express instance (same as in server.js)
const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "studdy-buddy-production.up.railway.app",
        "https://studdy-buddy-maiin.onrender.com"
    ],
    credentials: true,
}));

// Create the HTTP server using Express app (this is now the same server as in server.js)
const server = http.createServer(app);

// Initialize Socket.IO and attach it to the same server
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "studdy-buddy-production.up.railway.app",
            "https://studdy-buddy-maiin.onrender.com"
        ],
        credentials: true,
    }
});

const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.auth?.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log("Registered userId:", userId);
    }

    // Emit the list of online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);

        const disconnectedUserId = Object.keys(userSocketMap).find(
            key => userSocketMap[key] === socket.id
        );

        if (disconnectedUserId) {
            delete userSocketMap[disconnectedUserId];
            console.log("Removed userId:", disconnectedUserId);
        }

        // Emit the updated list of online users
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// Export io and server to use them in server.js
export { io, app, server };
