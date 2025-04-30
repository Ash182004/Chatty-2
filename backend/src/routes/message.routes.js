import express from "express";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔄 Changed the route to avoid conflict
router.get("/sidebar-users", protectRoute, getUsersForSidebar); // ✅ safe
router.get("/:id", protectRoute, getMessages);           // ✅ safe
router.post("/:id", protectRoute, sendMessage);          // ✅ safe

export default router;

console.log("✅ Message routes loaded");
