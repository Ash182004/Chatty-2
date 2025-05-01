import express from "express";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Static routes
router.get("/sidebar-users", protectRoute, getUsersForSidebar);

// Dynamic routes
router.get("/messages/:id", protectRoute, validateMessageId, getMessages);
router.post("/messages/:id", protectRoute, validateMessageId, sendMessage);

// Parameter validation middleware
function validateMessageId(req, res, next) {
  const { id } = req.params;
  if (!id || typeof id !== "string" || id.length < 1) {
    return res.status(400).json({ error: "Invalid message ID format" });
  }
  next();
}

export default router;
