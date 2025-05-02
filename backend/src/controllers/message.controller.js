import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, getIo } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Validate recipient
    const recipient = await User.findById(receiverId);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Validate content
    if (!text?.trim() && !image) {
      return res.status(400).json({ error: "Message content required" });
    }

    // Handle image upload
    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat_images",
      });
      imageUrl = uploadResponse?.secure_url;
    }

    // Create and save message
    const newMessage = new Message({
      senderId,
      receiverId,
      text: text?.trim(),
      image: imageUrl,
    });
    await newMessage.save();

    // Emit to both parties
    const io = getIo();
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);
    if (senderSocketId) io.to(senderSocketId).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
};