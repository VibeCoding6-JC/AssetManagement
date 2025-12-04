import express from "express";
import {
    getVendors,
    getVendorById,
    createVendor,
    updateVendor,
    deleteVendor
} from "../controllers/VendorController.js";
import { verifyToken, adminOnly, staffOrAdmin } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes accessible by staff and admin
router.get("/", staffOrAdmin, getVendors);
router.get("/:id", staffOrAdmin, getVendorById);

// Admin only routes
router.post("/", adminOnly, createVendor);
router.put("/:id", adminOnly, updateVendor);
router.delete("/:id", adminOnly, deleteVendor);

export default router;
