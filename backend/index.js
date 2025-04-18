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

import scheduler from './cron/scheduler.js';
import { connectDB } from './db/connectDB.js';
import { app, server } from './lib/socket.js';

dotenv.config();


const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://studdy-buddy-maiin-production.up.railway.app",
        "https://studdy-buddy-maiin.onrender.com"
    ],
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/schedule", sched_taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/archieve", archieveRoutes);
app.use("/api/superAdmin", adminRoutes);
app.use("/api/chat", messageRoutes);


if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '/frontend/dist')))

    app.get("*", (_, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });

}

server.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on  http://localhost:${PORT}`);

});