import express from "express";
import http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.routes.js";
import { setupSocket } from "./lib/socket.js"; // Correct import

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

const server = http.createServer(app); // Create the HTTP server
setupSocket(server); // Setup socket.io

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173", // Your local dev frontend
  "https://chatty-2-gk04.onrender.com", // If using Vercel
  // Your production frontend
];

const corsOptions = {
 
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Routes
// In index.js, modify the route order:
// 1. Keep API routes first
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// 2. Add specific frontend routes before wildcard
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
  // Add this before wildcard
  app.get("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });
  
  // Wildcard comes last
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

server.on('upgrade', (req, socket, head) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    server.emit('upgrade', req, socket, head);
  } else {
    console.warn(`Blocked WebSocket upgrade from: ${origin}`);
    socket.destroy();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    websocket: io?.engine?.clientsCount !== undefined,
    timestamp: new Date().toISOString()
  });
});

// DB + Start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });
