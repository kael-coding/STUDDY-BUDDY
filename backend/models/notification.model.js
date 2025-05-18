import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true,
    },
    from: {
        type: String,
        ref: "User",
    },
    postId: {
        type: String,
        ref: 'Post',
    },
    taskId: {
        type: String,
        ref: 'Schedule'
    },
    commentId: {
        type: String,
    },
    type: {
        type: String,
        required: true,
        enum: ['like', 'likeComment', 'comment', 'reply', 'overDue', 'completed', 'reminder'],
    },
    read: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;