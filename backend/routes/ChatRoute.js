import express from "express";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import { chat, getStatus, getSuggestions } from "../controllers/ChatController.js";

const router = express.Router();

// All chat routes require authentication
router.use(verifyToken);

// POST /api/chat - Send a chat message
router.post("/", chat);

// GET /api/chat/status - Get chat service status
router.get("/status", getStatus);

// GET /api/chat/suggestions - Get suggested questions
router.get("/suggestions", getSuggestions);

export default router;
