import { io } from "socket.io-client";
import { useAuthStore } from "./store/useAuthStore"; // Use your auth store

const SOCKET_URL = import.meta.env.PROD
  ? "https://chatty-2-gk04.onrender.com"
  : "http://localhost:5550";

let socket;

export const initSocket = () => {
  const { authUser } = useAuthStore.getState(); // Get current user from store
  
  if (!authUser?._id) {
    console.error("Cannot initialize socket - no authenticated user");
    return null;
  }

  socket = io(SOCKET_URL, {
    withCredentials: true,
    query: {
      userId: authUser._id // Use the actual user ID from auth state
    },
    transports: ["websocket", "polling"], // Allow fallback to polling
    path: "/socket.io",
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true // Let it connect immediately
  });

  // Connection handlers
  socket.on("connect", () => {
    console.log("Socket connected, ID:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
    setTimeout(() => {
      socket.connect();
    }, 1000);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initSocket first.");
  }
  return socket;
};