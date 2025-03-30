import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import sched_taskRoutes from './routes/sched_task.route.js';
import path from 'path';
import { connectDB } from './db/connectDB.js';
import scheduler from './cron/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Debug logs to ensure environment variables are set
console.log("Environment: ", process.env.NODE_ENV);
console.log("JWT Secret: ", process.env.JWT_SECRET);
console.log("Mongo URI: ", process.env.MONGO_URI);

app.use(express.json());
app.use(cookieParser());

// CORS Configuration: Allow different origins in development vs production
app.use((req, res, next) => {
    const allowedOrigins = [
        "http://localhost:5173",  // Local development URL
        process.env.CLIENT_URL,   // Dynamic production URL
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/schedule", sched_taskRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '/frontend/dist')));

    // Fallback route for single-page app
    app.get("*", (_, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

// Start server and connect to DB
app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});
