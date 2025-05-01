// lib/socket.js
import { Server } from "socket.io";

let ioInstance = null; // Store the io instance
const userSocketMap = {};

export const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://chatty-2-gk04.onrender.com"
      ],
      credentials: true,
      methods: ["GET", "POST"]
    },
    transports: ["websocket"],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  ioInstance = io; // Store the instance

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log("User connected:", userId);
    userSocketMap[userId] = socket.id;

    // Send online users list
    io.emit("onlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      delete userSocketMap[userId];
      io.emit("onlineUsers", Object.keys(userSocketMap));
      console.log("User disconnected:", userId);
    });

    socket.on("newMessage", (message) => {
      const receiverSocketId = userSocketMap[message.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageReceived", message);
      }
    });
  });

  return io;
};

// Export the getIo function
export const getIo = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized");
  }
  return ioInstance;
};

export const getReceiverSocketId = (userId) => userSocketMap[userId];