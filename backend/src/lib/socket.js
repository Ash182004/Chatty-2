import { Server } from "socket.io";

let ioInstance = null;
const userSocketMap = {};

export const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "https://chatty-2-gk04.onrender.com",
        "http://localhost:5173"
      ],
      credentials: true,
      methods: ["GET", "POST"]
    },
    transports: ["websocket"],
    pingTimeout: 60000,
    pingInterval: 25000,
    path: "/socket.io" // Must match frontend
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (!userId) {
      console.error("Connection rejected - missing userId");
      socket.disconnect();
      return;
    }

    console.log(`User ${userId} connected`);
    userSocketMap[userId] = socket.id;

    // Rest of your socket logic...
  });

  return io;
};

export const getIo = () => {
  if (!ioInstance) throw new Error("Socket.IO not initialized");
  return ioInstance;
};

export const getReceiverSocketId = (userId) => userSocketMap[userId];