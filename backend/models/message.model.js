import { text } from "express";
import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: String,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
    },
    images: {
        type: [String],
        default: [],
    },
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;
