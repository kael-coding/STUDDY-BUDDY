import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { setServers } from 'node:dns';

dotenv.config();

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        const dnsServers = process.env.MONGO_DNS_SERVERS?.split(',').map((server) => server.trim()).filter(Boolean);
        if (uri?.startsWith('mongodb+srv://') && dnsServers?.length) {
            setServers(dnsServers);
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
