import { io } from "socket.io-client";

// Safely get userId from localStorage
const userId = localStorage.getItem("userId") || "";

// Initialize the socket connection
const socket = io("http://localhost:5550", {
  query: {
    userId, // Ensures userId is never undefined
  },
  withCredentials: true, // Include credentials (cookies, etc.) for requests
});

// Handle socket connection
socket.on("connect", () => {
  console.log("Connected to Socket.IO server with socket id:", socket.id);
});

// Handle new message notifications
socket.on("newMessage", (message) => {
  console.log("New message received:", message);
});

// Handle online users update
socket.on("getOnlineUsers", (onlineUsers) => {
  console.log("Current online users:", onlineUsers);
});

// Export the socket instance for use in other parts of the app
export default socket;
