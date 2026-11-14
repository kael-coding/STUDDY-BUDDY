import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    userName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    lastlogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
    resetPasswordToken: { type: String, select: false },
    sessionVersion: { type: Number, default: 0, select: false },
    resetPasswordExpiresAt: { type: Date, select: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpiresAt: { type: Date, select: false },


    profilePicture: {
        type: String,
        default: ""
    },
    linkedPosts: [{
        type: String,
        ref: "Post",
        default: [],
    }],
    school: {
        type: String,
        default: ""
    },
    course: {
        type: String,
        default: ""
    },

}, {
    timestamps: true,
    toJSON: {
        transform(_document, data) {
            delete data.password;
            delete data.sessionVersion;
            delete data.resetPasswordToken;
            delete data.resetPasswordExpiresAt;
            delete data.verificationToken;
            delete data.verificationTokenExpiresAt;
            return data;
        },
    },
});

const User = mongoose.model("User", userSchema);

export default User;

