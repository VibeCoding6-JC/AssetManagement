import express from "express";
import {
    login,
    logout,
    refreshToken,
    getMe
} from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.get("/token", refreshToken);

// Protected routes
router.delete("/logout", verifyToken, logout);
router.get("/me", verifyToken, getMe);

export default router;
