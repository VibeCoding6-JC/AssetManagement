import express from "express";
import {
    getLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation
} from "../controllers/LocationController.js";
import { verifyToken, adminOnly, staffOrAdmin } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes accessible by staff and admin
router.get("/", staffOrAdmin, getLocations);
router.get("/:id", staffOrAdmin, getLocationById);

// Admin only routes
router.post("/", adminOnly, createLocation);
router.put("/:id", adminOnly, updateLocation);
router.delete("/:id", adminOnly, deleteLocation);

export default router;
