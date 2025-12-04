import express from "express";
import {
    getTransactions,
    getTransactionById,
    checkoutAsset,
    checkinAsset,
    sendToRepair,
    completeRepair,
    disposeAsset
} from "../controllers/TransactionController.js";
import { verifyToken, adminOnly, staffOrAdmin } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes accessible by staff and admin
router.get("/", staffOrAdmin, getTransactions);
router.get("/:id", staffOrAdmin, getTransactionById);

// Transaction operations - staff and admin
router.post("/checkout", staffOrAdmin, checkoutAsset);
router.post("/checkin", staffOrAdmin, checkinAsset);
router.post("/repair", staffOrAdmin, sendToRepair);
router.post("/complete-repair", staffOrAdmin, completeRepair);

// Dispose - admin only
router.post("/dispose", adminOnly, disposeAsset);

export default router;
