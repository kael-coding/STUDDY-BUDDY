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
    isRemovedByModerator: { type: Boolean, default: false, select: false },
    subject: { type: String, trim: true, maxlength: 60, default: "" },
    studyGroup: { type: mongoose.Schema.Types.ObjectId, ref: "StudyGroup", default: null },
    studyKind: { type: String, enum: ["discussion", "question", "resource", "session"], default: "discussion" },
    sessionAt: Date,
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

postSchema.index({ studyGroup: 1, createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1, _id: -1 });
// Community queries only access visible posts, including older posts without the flag.
postSchema.pre(/^find/, function () {
    this.where({ isRemovedByModerator: { $ne: true } });
});

const Post = mongoose.model('Post', postSchema);
export default Post;
