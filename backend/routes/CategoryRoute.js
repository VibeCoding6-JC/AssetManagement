import express from "express";
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/CategoryController.js";
import { verifyToken, adminOnly, staffOrAdmin } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes accessible by staff and admin
router.get("/", staffOrAdmin, getCategories);
router.get("/:id", staffOrAdmin, getCategoryById);

// Admin only routes
router.post("/", adminOnly, createCategory);
router.put("/:id", adminOnly, updateCategory);
router.delete("/:id", adminOnly, deleteCategory);

export default router;
