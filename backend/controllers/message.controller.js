import Message from "../models/message.,model.js";
import User from "../models/user.model.js"
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.userId;
        const filteredUsers = await User.find({ userId: { $ne: loggedInUserId } }).select("-password")

        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log("ERROR FOR THE GET USERSSIDE BAR", error)
        res.status(500).json({ error: "Internal server error" })
    }
}


export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.param;
        const myId = req.userId;

        const message = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        res.status(200).json(message)
    } catch (error) {
        console.log("ERROR FOR THE GET MESSAGE", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.userId;

        let imageUrl;
        if (image) {
            const uploadeResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadeResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        await newMessage.save()

        res.status(200).json({
            message: "Message sent successfully",
            data: newMessage
        })

    } catch (error) {
        console.log("ERROR FOR THE SEND MESSAGE", error)
        res.status(500).json({ error: "Internal server error" })

    }
}