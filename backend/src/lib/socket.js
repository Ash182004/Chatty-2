// lib/socket.js
import { Server } from "socket.io";
import http from "http";

const server = http.createServer();

let io;
const userSocketMap = {};

export const setupSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173", // Ensure this matches your client URL
      credentials: true,
      methods: ["GET", "POST"],
    },
    allowUpgrades: false,
    transports: ["websocket"], // Use only WebSocket for better performance
    perMessageDeflate: false,
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId; // Get the userId from the handshake query

    if (!userId) {
      console.error("User ID is missing in the handshake query");
      socket.disconnect(); // Disconnect if no userId is passed
      return;
    }

    console.log("User connected:", socket.id, "User ID:", userId);

    userSocketMap[userId] = socket.id; // Map userId to socket.id for future communication
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Broadcast online users

    socket.on("sendMessage", ({ message, receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message); // Emit message to receiver
      } else {
        console.error(`Receiver ${receiverId} not connected`);
      }
    });

    socket.on("disconnect", () => {
      if (userId) {
        delete userSocketMap[userId]; // Remove user from the online users map
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Update the online users list
      }
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const getReceiverSocketId = (userId) => userSocketMap[userId];
export const getIo = () => io;
export { server };
