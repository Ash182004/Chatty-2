import express from "express";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// 🔄 Changed the route to avoid conflict
router.get("/sidebar-users", protectRoute, getUsersForSidebar); // ✅ safe
// Ensure the route has a valid parameter
 // or mongoose.Types.ObjectId

// ✅ Validate `:id` before processing
router.get("/:id", protectRoute, (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
}, getMessages);

router.post("/:id", protectRoute, (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
}, sendMessage);



export default router;

console.log("✅ Message routes loaded");
