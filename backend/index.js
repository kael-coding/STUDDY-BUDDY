import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.route.js';
import sched_taskRoutes from './routes/sched_task.route.js';
import noteRoutes from './routes/notes.routes.js';
import archieveRoutes from './routes/archives.route.js';
import adminRoutes from './routes/admin.routes.js';
import messageRoutes from './routes/message.routes.js';
import communityRoutes from './routes/community.routes.js';

import scheduler from './cron/scheduler.js';
import { connectDB } from './db/connectDB.js';
import { io } from './lib/socket.js'; // Now you import 'io' from socket.js directly

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// CORS configuration for both local and production
app.use(cors({
    origin: [
        "http://localhost:5173",  // Local dev
        "https://studdy-buddy-maiin-production.up.railway.app",  // Production Railway URL
        "https://studdy-buddy-maiin.onrender.com"  // Production Render URL
    ],
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Routes setup
app.use("/api/auth", authRoutes);
app.use("/api/schedule", sched_taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/archieve", archieveRoutes);
app.use("/api/superAdmin", adminRoutes);
app.use("/api/chat", messageRoutes);
app.use("/api/community", communityRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '/frontend/dist')));
    app.get("*", (_, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

// Connect to the database and start the server
const server = app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});

io.attach(server);  // Attach Socket.IO to the existing HTTP server
