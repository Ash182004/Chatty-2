import { io } from "socket.io-client";
import { useAuthStore } from "./store/useAuthStore";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "https://chatty-2-gk04.onrender.com";

let socketInstance = null;

// Initialize and connect the socket
export const initSocket = () => {
  const { authUser } = useAuthStore.getState();
  
  if (socketInstance?.connected) return socketInstance;

  if (!authUser?._id) {
    console.warn("Socket initialization delayed - waiting for authentication");
    return null;
  }

  socketInstance = io(SOCKET_URL, {
    path: "/socket.io",
    transports: ["websocket"],
    withCredentials: true,
    auth: {
      token: authUser.token,
      userId: authUser._id
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socketInstance.on("connect", () => {
    console.log("Socket connected, ID:", socketInstance.id);
  });

  socketInstance.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socketInstance.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
  });

  return socketInstance;
};

// Get the active socket instance
export const getSocket = () => {
  if (!socketInstance) {
    console.warn("Socket accessed before initialization - initializing now");
    return initSocket();
  }
  return socketInstance;
};

// For backward compatibility
export default getSocket;