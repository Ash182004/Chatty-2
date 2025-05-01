import express from "express";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Static routes
router.get("/", protectRoute, getUsersForSidebar);

// Dynamic routes
router.get("/get/:messageId", protectRoute, validateMessageId, getMessages);
router.post("/send/:messageId", protectRoute, validateMessageId, sendMessage);

// Parameter validation middleware
// In message.routes.js
function validateMessageId(req, res, next) {
  const { messageId } = req.params;  // ✅ Changed from 'id' to 'messageId'
  if (!messageId || typeof messageId !== "string" || messageId.length < 1) {
    return res.status(400).json({ error: "Invalid message ID format" });
  }
  next();
}

export default router;
