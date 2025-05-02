import { io } from "socket.io-client";
import { useAuthStore } from "./store/useAuthStore";

const SOCKET_URL = import.meta.env.PROD
  ? "https://chatty-2-gk04.onrender.com"
  : "http://localhost:5550";

let socketInstance = null;

export const initSocket = () => {
  const { authUser } = useAuthStore.getState();
  
  if (socketInstance?.connected) return socketInstance;

  if (!authUser?._id) {
    console.warn("Socket initialization delayed - waiting for authentication");
    return null;
  }

  socketInstance = io(SOCKET_URL, {
    withCredentials: true,
    auth: {
      userId: authUser._id
    },
    transports: ["websocket", "polling"],
    path: "/socket.io",
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true
  });

  socketInstance.on("connect", () => {
    console.log("Socket connected, ID:", socketInstance.id);
  });

  socketInstance.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socketInstance.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
    setTimeout(() => {
      socketInstance.connect();
    }, 1000);
  });

  return socketInstance;
};

export const getSocket = () => {
  if (!socketInstance) {
    console.warn("Socket accessed before initialization - returning dummy socket");
    return {
      on: () => {},
      off: () => {},
      emit: () => {},
      connected: false
    };
  }
  return socketInstance;
};

export default getSocket;