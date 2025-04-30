import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.routes.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000; // Default port is 5000 if not provided
const __dirname = path.resolve();

// 🛠️ Increase the payload limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // Frontend running on this port
    credentials: true,
  })
);


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Production static file handling
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}
console.log("🧭 Mounting messageRoutes at /api/messages");

// 🛠 Connect DB and THEN start server
connectDB()
  .then(() => {
    // Print all registered routes
    app?._router?.stack?.forEach(r => {
      if (r.route) {
        console.log("✅ Route:", r.route.path);
      }
    });
    

    // Start server
    server.listen(PORT, () => {
      console.log("✅ Server is running on PORT:", PORT);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
  });


// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1)); // Gracefully shutdown the server
});

