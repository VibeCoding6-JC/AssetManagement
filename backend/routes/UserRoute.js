import express from "express";
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserAssets
} from "../controllers/UserController.js";
import { verifyToken, adminOnly, staffOrAdmin } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes accessible by staff and admin
router.get("/", staffOrAdmin, getUsers);
router.get("/:id", staffOrAdmin, getUserById);
router.get("/:id/assets", staffOrAdmin, getUserAssets);

// Admin only routes
router.post("/", adminOnly, createUser);
router.put("/:id", adminOnly, updateUser);
router.delete("/:id", adminOnly, deleteUser);

export default router;
