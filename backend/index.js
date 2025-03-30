import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import sched_taskRoutes from './routes/sched_task.route.js';
import cors from 'cors';
import path from 'path';
import { connectDB } from './db/connectDB.js';
import scheduler from './cron/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();


app.use(cors({
    origin: [
        "http://localhost:5173",  // Local dev URL
        "https://studdy-buddy-maiin-production.up.railway.app",
        "https://studdy-buddy-maiin.onrender.com" // Production URL
    ],
    credentials: true,  // Allows cookies to be sent with the requests
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/schedule", sched_taskRoutes);

if (process.env.NODE_ENV === "production") {
    // Serve frontend in production
    app.use(express.static(path.join(__dirname, '/frontend/dist')));

    // Fallback route for single-page app
    app.get("*", (_, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});
