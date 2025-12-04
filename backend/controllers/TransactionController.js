import { Op } from "sequelize";
import db from "../config/Database.js";
import { Assets, Users, Transactions } from "../models/index.js";

/**
 * Valid State Transitions (State Machine)
 */
const VALID_TRANSITIONS = {
    available: ["assigned", "repair", "retired"],
    assigned: ["available", "repair", "missing"],
    repair: ["available", "retired"],
    missing: ["available", "retired"],
    retired: [] // Terminal state
};

/**
 * Check if state transition is valid
 */
const isValidTransition = (currentStatus, newStatus) => {
    return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};

/**
 * Get All Transactions
 * GET /api/transactions
 */
export const getTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            action_type = "",
            start_date = "",
            end_date = ""
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const whereClause = {};

        if (action_type) {
            whereClause.action_type = action_type;
        }

        if (start_date && end_date) {
            whereClause.transaction_date = {
                [Op.between]: [new Date(start_date), new Date(end_date + " 23:59:59")]
            };
        } else if (start_date) {
            whereClause.transaction_date = {
                [Op.gte]: new Date(start_date)
            };
        } else if (end_date) {
            whereClause.transaction_date = {
                [Op.lte]: new Date(end_date + " 23:59:59")
            };
        }

        const { count, rows } = await Transactions.findAndCountAll({
            where: whereClause,
            include: [
                {
                    association: "asset",
                    attributes: ["uuid", "name", "asset_tag", "serial_number"]
                },
                {
                    association: "employee",
                    attributes: ["uuid", "name", "email", "department"]
                },
                {
                    association: "admin",
                    attributes: ["uuid", "name", "email"]
                }
            ],
            order: [["transaction_date", "DESC"]],
            limit: parseInt(limit),
            offset: offset
        });

        res.status(200).json({
            success: true,
            data: rows,
            meta: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("Get Transactions Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get Transaction by ID
 * GET /api/transactions/:id
 */
export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transactions.findOne({
            where: { uuid: req.params.id },
            include: [
                {
                    association: "asset",
                    attributes: ["uuid", "name", "asset_tag", "serial_number", "status"]
                },
                {
                    association: "employee",
                    attributes: ["uuid", "name", "email", "department", "phone"]
                },
                {
                    association: "admin",
                    attributes: ["uuid", "name", "email"]
                }
            ]
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error("Get Transaction Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Checkout Asset (Assign to User)
 * POST /api/transactions/checkout
 */
export const checkoutAsset = async (req, res) => {
    const t = await db.transaction();
    
    try {
        const { 
            asset_id, 
            user_id, 
            transaction_date,
            expected_return_date,
            notes 
        } = req.body;

        // Validate required fields
        if (!asset_id || !user_id) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: "Asset ID and User ID are required"
            });
        }

        // Find asset
        const asset = await Assets.findOne({ where: { uuid: asset_id } });
        if (!asset) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        // Validate state transition
        if (!isValidTransition(asset.status, "assigned")) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Cannot checkout asset. Current status is '${asset.status}'. Only 'available' assets can be checked out.`
            });
        }

        // Find user (employee)
        const user = await Users.findOne({ where: { uuid: user_id } });
        if (!user) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update asset status
        await Assets.update(
            {
                status: "assigned",
                current_holder_id: user.id
            },
            { where: { id: asset.id }, transaction: t }
        );

        // Create transaction record
        const transactionRecord = await Transactions.create({
            asset_id: asset.id,
            user_id: user.id,
            admin_id: req.userId,
            action_type: "checkout",
            transaction_date: transaction_date || new Date(),
            expected_return_date,
            condition_before: asset.condition,
            notes
        }, { transaction: t });

        await t.commit();

        // Fetch complete transaction with relations
        const completeTransaction = await Transactions.findOne({
            where: { id: transactionRecord.id },
            include: [
                { association: "asset", attributes: ["uuid", "name", "asset_tag"] },
                { association: "employee", attributes: ["uuid", "name", "email"] },
                { association: "admin", attributes: ["uuid", "name"] }
            ]
        });

        res.status(201).json({
            success: true,
            message: "Asset checked out successfully",
            data: completeTransaction
        });
    } catch (error) {
        await t.rollback();
        console.error("Checkout Asset Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Checkin Asset (Return from User)
 * POST /api/transactions/checkin
 */
export const checkinAsset = async (req, res) => {
    const t = await db.transaction();
    
    try {
        const { 
            asset_id, 
            transaction_date,
            condition_after,
            notes 
        } = req.body;

        // Validate required fields
        if (!asset_id) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: "Asset ID is required"
            });
        }

        // Find asset
        const asset = await Assets.findOne({ 
            where: { uuid: asset_id },
            include: [{ association: "holder", attributes: ["id", "uuid", "name"] }]
        });
        
        if (!asset) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        // Validate asset is assigned
        if (asset.status !== "assigned") {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Cannot checkin asset. Current status is '${asset.status}'. Only 'assigned' assets can be checked in.`
            });
        }

        // Determine new status based on condition
        let newStatus = "available";
        let newCondition = condition_after || asset.condition;
        
        if (condition_after === "damaged" || condition_after === "poor") {
            newStatus = "repair";
            newCondition = "poor";
        }

        // Store the previous holder for the transaction record
        const previousHolderId = asset.current_holder_id;

        // Update asset status
        await Assets.update(
            {
                status: newStatus,
                condition: newCondition,
                current_holder_id: null
            },
            { where: { id: asset.id }, transaction: t }
        );

        // Create transaction record
        const transactionRecord = await Transactions.create({
            asset_id: asset.id,
            user_id: previousHolderId,
            admin_id: req.userId,
            action_type: "checkin",
            transaction_date: transaction_date || new Date(),
            actual_return_date: new Date(),
            condition_before: asset.condition,
            condition_after: newCondition,
            notes
        }, { transaction: t });

        await t.commit();

        // Fetch complete transaction
        const completeTransaction = await Transactions.findOne({
            where: { id: transactionRecord.id },
            include: [
                { association: "asset", attributes: ["uuid", "name", "asset_tag", "status"] },
                { association: "employee", attributes: ["uuid", "name", "email"] },
                { association: "admin", attributes: ["uuid", "name"] }
            ]
        });

        res.status(201).json({
            success: true,
            message: `Asset checked in successfully. Status: ${newStatus}`,
            data: completeTransaction
        });
    } catch (error) {
        await t.rollback();
        console.error("Checkin Asset Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Send Asset to Repair
 * POST /api/transactions/repair
 */
export const sendToRepair = async (req, res) => {
    const t = await db.transaction();
    
    try {
        const { asset_id, transaction_date, notes } = req.body;

        if (!asset_id) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: "Asset ID is required"
            });
        }

        const asset = await Assets.findOne({ where: { uuid: asset_id } });
        if (!asset) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        // Validate state transition
        if (!isValidTransition(asset.status, "repair")) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Cannot send to repair. Current status is '${asset.status}'.`
            });
        }

        const previousHolderId = asset.current_holder_id;

        // Update asset status
        await Assets.update(
            {
                status: "repair",
                current_holder_id: null
            },
            { where: { id: asset.id }, transaction: t }
        );

        // Create transaction record
        await Transactions.create({
            asset_id: asset.id,
            user_id: previousHolderId,
            admin_id: req.userId,
            action_type: "repair",
            transaction_date: transaction_date || new Date(),
            condition_before: asset.condition,
            notes: notes || "Sent to repair"
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            message: "Asset sent to repair successfully"
        });
    } catch (error) {
        await t.rollback();
        console.error("Send to Repair Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Complete Repair
 * POST /api/transactions/complete-repair
 */
export const completeRepair = async (req, res) => {
    const t = await db.transaction();
    
    try {
        const { asset_id, transaction_date, condition_after, notes } = req.body;

        if (!asset_id) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: "Asset ID is required"
            });
        }

        const asset = await Assets.findOne({ where: { uuid: asset_id } });
        if (!asset) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        // Validate current status is repair
        if (asset.status !== "repair") {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Asset is not in repair. Current status is '${asset.status}'.`
            });
        }

        const newCondition = condition_after || "good";

        // Update asset status
        await Assets.update(
            {
                status: "available",
                condition: newCondition
            },
            { where: { id: asset.id }, transaction: t }
        );

        // Create transaction record
        await Transactions.create({
            asset_id: asset.id,
            user_id: null,
            admin_id: req.userId,
            action_type: "complete_repair",
            transaction_date: transaction_date || new Date(),
            condition_before: asset.condition,
            condition_after: newCondition,
            notes: notes || "Repair completed"
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            message: "Repair completed. Asset is now available."
        });
    } catch (error) {
        await t.rollback();
        console.error("Complete Repair Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Dispose Asset (Retire)
 * POST /api/transactions/dispose
 */
export const disposeAsset = async (req, res) => {
    const t = await db.transaction();
    
    try {
        const { asset_id, transaction_date, notes } = req.body;

        if (!asset_id) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: "Asset ID is required"
            });
        }

        const asset = await Assets.findOne({ where: { uuid: asset_id } });
        if (!asset) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        // Validate state transition
        if (!isValidTransition(asset.status, "retired")) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Cannot dispose asset. Current status is '${asset.status}'. Only available, repair, or missing assets can be disposed.`
            });
        }

        // Update asset status
        await Assets.update(
            {
                status: "retired",
                current_holder_id: null
            },
            { where: { id: asset.id }, transaction: t }
        );

        // Create transaction record
        await Transactions.create({
            asset_id: asset.id,
            user_id: null,
            admin_id: req.userId,
            action_type: "dispose",
            transaction_date: transaction_date || new Date(),
            condition_before: asset.condition,
            notes: notes || "Asset disposed/retired"
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            message: "Asset disposed successfully"
        });
    } catch (error) {
        await t.rollback();
        console.error("Dispose Asset Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};
