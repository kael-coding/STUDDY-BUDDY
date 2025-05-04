import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        ref: 'User',
        required: true,
    },
    text: {
        type: String
    },
    image: {
        type: String,
        default: ""
    },
    comments: [{
        _id: { type: String, required: true },
        user: { type: String, ref: 'User', required: true },
        text: {
            type: String,
        },
        likesComment: [{
            type: String,
            ref: 'User'
        }],
        replies: [{
            _id: { type: String, required: true },
            user: { type: String, ref: 'User', required: true },
            text: {
                type: String,
            },
            likesReply: [{
                type: String,
                ref: 'User'
            }],
            replies: [{
                _id: { type: String, required: true },
                user: { type: String, ref: 'User', required: true },
                text: {
                    type: String,
                },
                likesReplyToReply: [{
                    type: String,
                    ref: 'User'
                }],
                replyTo: { type: String }
            }]
        }],
    }],
    likes: [{
        type: String,
        ref: 'User'
    }],
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
export default Post;