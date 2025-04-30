import express from "express";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// 1. Static routes first (with full path)
router.get("/messages/sidebar-users", protectRoute, getUsersForSidebar);

// 2. Dynamic routes with explicit validation
router.get("/messages/:id", protectRoute, validateMessageId, getMessages);  // Updated: 'messageId' to 'id'
router.post("/messages/:id", protectRoute, validateMessageId, sendMessage);  // Updated: 'messageId' to 'id'

// Parameter validation middleware
function validateMessageId(req, res, next) {
  const { id } = req.params;  // Updated: 'messageId' to 'id'
  if (!id || typeof id !== "string" || id.length < 1) {
    return res.status(400).json({ error: "Invalid message ID format" });
  }
  next();
}

// Debug route registration
const printRoutes = () => {
  router.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      console.log(`Registered: ${methods} ${layer.route.path}`);
    }
  });
};

printRoutes();

export default router;
