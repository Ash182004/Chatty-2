import express from "express";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// 1. Static routes first
router.get("/sidebar-users", protectRoute, getUsersForSidebar);

// 2. Dynamic routes with explicit parameter names
router.get("/:messageId", protectRoute, getMessages);  // Changed from :id to :messageId
router.post("/:messageId", protectRoute, sendMessage);

// 3. Add parameter validation middleware
router.param("messageId", (req, res, next, id) => {
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid message ID" });
  }
  next();
});

console.log("✅ Message routes loaded - verified paths:");
console.log("GET /messages/sidebar-users");
console.log("GET /messages/:messageId");
console.log("POST /messages/:messageId");

export default router;