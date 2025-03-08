import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import sched_taskRoutes from './routes/Sched_task.route.js';
import cors from 'cors';
import schedule from './cron/scheduler.js';


import { connectDB } from './db/connectDB.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/schedule", sched_taskRoutes)


app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on  http://localhost:${PORT}`);
});