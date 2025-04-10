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
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,


    profilePicture: {
        type: String,
        default: ""
    }

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;

