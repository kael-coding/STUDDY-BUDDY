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
    editedAt: Date,
}, { timestamps: true });

messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
