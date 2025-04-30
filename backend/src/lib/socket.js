// lib/socket.js
import { Server } from "socket.io";
import http from "http";

const server = http.createServer();

let io;
const userSocketMap = {};

export const setupSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
    allowUpgrades: false,
    transports: ["websocket"],
    perMessageDeflate: false,
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    socket.on("sendMessage", ({ message, receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }
    });

    socket.on("disconnect", () => {
      if (userId) {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
};

export const getReceiverSocketId = (userId) => userSocketMap[userId];
export const getIo = () => io;
export { server };
