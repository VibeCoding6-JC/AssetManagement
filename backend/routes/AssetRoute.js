import express from "express";
import {
    getAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    getAssetHistory
} from "../controllers/AssetController.js";
import { verifyToken, adminOnly, staffOrAdmin } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes accessible by staff and admin
router.get("/", staffOrAdmin, getAssets);
router.get("/:id", staffOrAdmin, getAssetById);
router.get("/:id/history", staffOrAdmin, getAssetHistory);

// Create and update - staff and admin
router.post("/", staffOrAdmin, createAsset);
router.put("/:id", staffOrAdmin, updateAsset);

// Delete - admin only
router.delete("/:id", adminOnly, deleteAsset);

export default router;
