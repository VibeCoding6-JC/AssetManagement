import express from "express";
import {
    getDashboardStats,
    getAssetValueReport,
    getActivityReport
} from "../controllers/DashboardController.js";
import { verifyToken, staffOrAdmin } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Dashboard routes - staff and admin
router.get("/stats", staffOrAdmin, getDashboardStats);
router.get("/reports/value", staffOrAdmin, getAssetValueReport);
router.get("/reports/activity", staffOrAdmin, getActivityReport);

export default router;
