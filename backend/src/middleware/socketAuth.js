import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) throw new Error("No token provided");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) throw new Error("User not found");

    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket auth error:", error.message);
    next(new Error("Authentication failed"));
  }
};