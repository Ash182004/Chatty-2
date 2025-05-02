export const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "https://chatty-2-gk04.onrender.com",
        "http://localhost:5173"
      ],
      credentials: true
    },
    transports: ["websocket", "polling"], // Match frontend
    path: "/socket.io",
    pingTimeout: 60000,
    pingInterval: 25000
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId; // Changed from query to auth
    console.log(`Connection attempt from userId: ${userId}`);
    
    if (!userId) {
      console.error("No userId - disconnecting");
      return socket.disconnect();
    }

    // Store socket mapping
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);

    // Broadcast online status
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};