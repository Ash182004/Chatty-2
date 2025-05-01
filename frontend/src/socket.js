import { io } from "socket.io-client";

// Get userId from your auth state (don't use localStorage directly)
const currentUserId = localStorage.getItem("userId") || "";

// ENSURE THIS MATCHES YOUR RENDER URL EXACTLY
const SOCKET_URL = import.meta.env.PROD
  ? "https://chatty-2-gk04.onrender.com" 
  : "http://localhost:5550";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  query: {
    userId: currentUserId
  },
  transports: ["websocket"], // Force WebSocket only
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  path: "/socket.io" // Explicit path
});

// Connection handlers
socket.on("connect", () => {
  console.log("Connected with ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Connection failed:", err.message);
  // Implement your error handling (e.g., show toast)
});

// Only connect if we have a userId
if (currentUserId) {
  socket.connect();
} else {
  console.error("Socket connection aborted - missing userId");
  // Consider redirecting to login
}

export default socket;