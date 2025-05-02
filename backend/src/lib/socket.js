import { Server } from "socket.io";

let ioInstance = null;
const userSocketMap = {};

export const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        
        "https://chatty-2-gk04.onrender.com"
      ],
      credentials: true,
      methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
    path: "/socket.io/",  // Note the trailing slash
    cookie: true,
    allowEIO3: true  // For Socket.IO v2/v3 compatibility
  });

  ioInstance = io;

  // Add authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    // Verify token here (JWT verification)
    next();
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    const userId = socket.handshake.auth.userId;
    
    if (!userId) {
      console.error("No userId - disconnecting");
      return socket.disconnect(true);
    }

    // Store socket mapping
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);

    // Broadcast online status
    io.emit("onlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
      delete userSocketMap[userId];
      io.emit("onlineUsers", Object.keys(userSocketMap));
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  });

  // Add engine-level error handling
  io.engine.on("connection_error", (err) => {
    console.error("Engine connection error:", err);
  });

  return io;
};

export const getIo = () => {
  if (!ioInstance) throw new Error("Socket.IO not initialized");
  return ioInstance;
};

export const getReceiverSocketId = (userId) => userSocketMap[userId];