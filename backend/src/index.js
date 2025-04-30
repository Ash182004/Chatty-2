import express from "express";
import http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.routes.js";
import { setupSocket } from "./lib/socket.js"; // change this!

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

const server = http.createServer(app); // ✅ Create HTTP server with app
setupSocket(server); // ✅ Setup socket.io here

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
};
app.use(cors(corsOptions));

// Routes
app.use("/api/auth", authRoutes);
// Change from:
app.use("/api/messages", messageRoutes);

// To:
app.use("/api/messages", (req, res, next) => {
  console.log(`Messages route accessed: ${req.method} ${req.path}`);
  next();
}, messageRoutes);
// Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// DB + Start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });
