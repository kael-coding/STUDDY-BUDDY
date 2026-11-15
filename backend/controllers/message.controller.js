import Message from "../models/message.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { emitToUser } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.userId;
        const latest = await Message.aggregate([
            { $match: { $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }] } },
            { $sort: { createdAt: -1, _id: -1 } },
            { $group: {
                _id: { $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"] },
                lastMessage: { $first: { text: "$text", images: "$images", createdAt: "$createdAt", senderId: "$senderId" } },
            } },
        ]);
        if (!latest.length) return res.json([]);
        const users = await User.find({ _id: { $in: latest.map(({ _id }) => _id), $ne: loggedInUserId } })
            .select("userName profilePicture role").lean();
        const contacts = new Map(users.map((user) => [user._id, user]));
        res.status(200).json(latest.flatMap(({ _id, lastMessage }) => {
            const contact = contacts.get(_id);
            return contact ? [{ ...contact, lastMessage }] : [];
        }));
    } catch (error) {
        console.error("ERROR FOR THE GET USERSSIDE BAR", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const searchChatContacts = async (req, res, next) => {
    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 60) : "";
    const adminOnly = req.query.role === "admin";
    const page = Number(req.query.page ?? 1);
    const pageSize = 25;
    if (!Number.isSafeInteger(page) || page < 1 || page > Math.floor(Number.MAX_SAFE_INTEGER / pageSize)) {
        return res.status(400).json({ message: "Invalid contacts page." });
    }

    const filter = {
        _id: { $ne: req.userId },
        isVerified: true,
        role: adminOnly ? "admin" : { $in: ["user", "admin"] },
    };
    if (search) filter.userName = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    try {
        const contacts = await User.find(filter).select("userName profilePicture role")
            .sort({ userName: 1, _id: 1 }).skip((page - 1) * pageSize).limit(pageSize + 1).lean();
        res.set("X-Has-More", String(contacts.length > pageSize)).json(contacts.slice(0, pageSize));
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.userId;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error("ERROR FOR THE GET MESSAGE", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
        const { id: receiverId } = req.params;
        const senderId = req.userId;

        if (!text && !req.files?.length) {
            return res.status(400).json({ message: "Enter a message or attach an image." });
        }
        if (receiverId === senderId || !await User.exists({ _id: receiverId })) {
            return res.status(404).json({ message: "Chat recipient not found." });
        }

        let imageUrls = [];

        if (req.files && req.files.length > 0) {
            imageUrls = await Promise.all(req.files.map(file => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: "image" },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result.secure_url);
                        }
                    );
                    stream.end(file.buffer); // ✅ required for memoryStorage
                });
            }));
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            images: imageUrls, // ✅ match schema
        });

        await newMessage.save();

        emitToUser(receiverId, "newMessage", newMessage);

        res.status(200).json(newMessage);
    } catch (error) {
        console.error("ERROR FOR SEND MESSAGE", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

function broadcastMessageChange({ senderId, receiverId }) {
    const conversation = { senderId, receiverId };
    emitToUser(senderId, "messageChanged", conversation);
    emitToUser(receiverId, "messageChanged", conversation);
}

export async function editMessage(req, res, next) {
    const { id } = req.params;
    const { text } = req.body ?? {};
    if (!mongoose.isObjectIdOrHexString(id) || typeof text !== "string") {
        return res.status(400).json({ message: "Enter valid message text." });
    }

    try {
        const filter = { _id: id, senderId: req.userId };
        const current = await Message.findOne(filter).lean();
        if (!current) return res.status(404).json({ message: "Message not found." });
        const value = text.trim();
        if (!value && !current.images?.length) {
            return res.status(400).json({ message: "A message without an attachment needs text." });
        }
        if (value === (current.text ?? "")) return res.json(current);

        const message = await Message.findOneAndUpdate(filter, { $set: { text: value, editedAt: new Date() } }, { new: true }).lean();
        if (!message) return res.status(404).json({ message: "Message not found." });
        broadcastMessageChange(message);
        res.json(message);
    } catch (error) {
        next(error);
    }
}

export async function deleteMessage(req, res, next) {
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: "Invalid message ID." });

    try {
        const message = await Message.findOneAndDelete({ _id: id, senderId: req.userId })
            .select("senderId receiverId").lean();
        if (!message) return res.status(404).json({ message: "Message not found." });
        broadcastMessageChange(message);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
}
