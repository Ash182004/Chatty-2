import { io } from "socket.io-client";
import { useAuthStore } from "./store/useAuthStore";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5550";

let socketInstance = null;

export const initSocket = () => {
  const { authUser } = useAuthStore.getState();
  
  if (socketInstance?.connected) return socketInstance;

  if (!authUser?._id) {
    console.warn("Cannot initialize socket - no authenticated user");
    return null;
  }

  socketInstance = io(SOCKET_URL, {
    path: "/socket.io/",  // Must match server
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    withCredentials: true,
    auth: {
      token: authUser.token,  // Ensure token is included
      userId: authUser._id
    }
  });

  socketInstance.on("connect", () => {
    console.log("Socket connected, ID:", socketInstance.id);
  });

  socketInstance.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    if (reason === "io server disconnect") {
      setTimeout(() => socketInstance.connect(), 1000);
    }
  });

  socketInstance.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
    setTimeout(() => socketInstance.connect(), 2000);
  });

  return socketInstance;
};