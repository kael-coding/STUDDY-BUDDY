import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.userId;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("ERROR FOR THE GET USERSSIDE BAR", error);
        res.status(500).json({ error: "Internal server error" });
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
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.userId;

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

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(200).json(newMessage);
    } catch (error) {
        console.error("ERROR FOR SEND MESSAGE", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
