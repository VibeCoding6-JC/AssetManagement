import { Op, fn, col, literal } from "sequelize";
import { Assets, Categories, Locations, Transactions, Users } from "../models/index.js";

/**
 * Get Dashboard Statistics
 * GET /api/dashboard/stats
 */
export const getDashboardStats = async (req, res) => {
    try {
        // Total assets count
        const totalAssets = await Assets.count();

        // Assets by status
        const assetsByStatus = await Assets.findAll({
            attributes: [
                "status",
                [fn("COUNT", col("id")), "count"]
            ],
            group: ["status"],
            raw: true
        });

        // Format status counts
        const statusCounts = {
            available: 0,
            assigned: 0,
            repair: 0,
            retired: 0,
            missing: 0
        };
        assetsByStatus.forEach(item => {
            statusCounts[item.status] = parseInt(item.count);
        });

        // Assets by category
        const assetsByCategory = await Assets.findAll({
            attributes: [
                [fn("COUNT", col("assets.id")), "count"]
            ],
            include: [{
                association: "category",
                attributes: ["uuid", "name"]
            }],
            group: ["category.id"],
            raw: true,
            nest: true
        });

        // Assets by location
        const assetsByLocation = await Assets.findAll({
            attributes: [
                [fn("COUNT", col("assets.id")), "count"]
            ],
            include: [{
                association: "location",
                attributes: ["uuid", "name"]
            }],
            group: ["location.id"],
            raw: true,
            nest: true
        });

        // Recent transactions (last 10)
        const recentTransactions = await Transactions.findAll({
            include: [
                {
                    association: "asset",
                    attributes: ["uuid", "name", "asset_tag"]
                },
                {
                    association: "employee",
                    attributes: ["uuid", "name"]
                },
                {
                    association: "admin",
                    attributes: ["uuid", "name"]
                }
            ],
            order: [["transaction_date", "DESC"]],
            limit: 10
        });

        // Assets with expiring warranty (within 30 days)
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const expiringWarranty = await Assets.findAll({
            where: {
                warranty_expiry: {
                    [Op.between]: [today, thirtyDaysFromNow]
                },
                status: {
                    [Op.ne]: "retired"
                }
            },
            attributes: ["uuid", "name", "asset_tag", "warranty_expiry"],
            include: [{
                association: "category",
                attributes: ["name"]
            }],
            order: [["warranty_expiry", "ASC"]],
            limit: 5
        });

        // Total users and employees
        const totalUsers = await Users.count({
            where: { role: { [Op.in]: ["admin", "staff"] } }
        });
        const totalEmployees = await Users.count({
            where: { role: "employee" }
        });

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalAssets,
                    totalUsers,
                    totalEmployees,
                    ...statusCounts
                },
                assetsByCategory: assetsByCategory.map(item => ({
                    category: item.category?.name || "Unknown",
                    categoryId: item.category?.uuid,
                    count: parseInt(item.count)
                })),
                assetsByLocation: assetsByLocation.map(item => ({
                    location: item.location?.name || "Unknown",
                    locationId: item.location?.uuid,
                    count: parseInt(item.count)
                })),
                recentTransactions,
                expiringWarranty
            }
        });
    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get Asset Value Report
 * GET /api/dashboard/reports/value
 */
export const getAssetValueReport = async (req, res) => {
    try {
        // Total asset value
        const totalValue = await Assets.sum("purchase_price", {
            where: { status: { [Op.ne]: "retired" } }
        });

        // Value by category
        const valueByCategory = await Assets.findAll({
            attributes: [
                [fn("SUM", col("purchase_price")), "total_value"],
                [fn("COUNT", col("assets.id")), "count"]
            ],
            include: [{
                association: "category",
                attributes: ["uuid", "name"]
            }],
            where: { status: { [Op.ne]: "retired" } },
            group: ["category.id"],
            raw: true,
            nest: true
        });

        // Value by location
        const valueByLocation = await Assets.findAll({
            attributes: [
                [fn("SUM", col("purchase_price")), "total_value"],
                [fn("COUNT", col("assets.id")), "count"]
            ],
            include: [{
                association: "location",
                attributes: ["uuid", "name"]
            }],
            where: { status: { [Op.ne]: "retired" } },
            group: ["location.id"],
            raw: true,
            nest: true
        });

        // Value by status
        const valueByStatus = await Assets.findAll({
            attributes: [
                "status",
                [fn("SUM", col("purchase_price")), "total_value"],
                [fn("COUNT", col("id")), "count"]
            ],
            group: ["status"],
            raw: true
        });

        res.status(200).json({
            success: true,
            data: {
                totalValue: totalValue || 0,
                valueByCategory: valueByCategory.map(item => ({
                    category: item.category?.name || "Unknown",
                    totalValue: parseFloat(item.total_value) || 0,
                    count: parseInt(item.count)
                })),
                valueByLocation: valueByLocation.map(item => ({
                    location: item.location?.name || "Unknown",
                    totalValue: parseFloat(item.total_value) || 0,
                    count: parseInt(item.count)
                })),
                valueByStatus: valueByStatus.map(item => ({
                    status: item.status,
                    totalValue: parseFloat(item.total_value) || 0,
                    count: parseInt(item.count)
                }))
            }
        });
    } catch (error) {
        console.error("Get Asset Value Report Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get Activity Report
 * GET /api/dashboard/reports/activity
 */
export const getActivityReport = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Transactions by action type
        const transactionsByType = await Transactions.findAll({
            attributes: [
                "action_type",
                [fn("COUNT", col("id")), "count"]
            ],
            where: {
                transaction_date: { [Op.gte]: startDate }
            },
            group: ["action_type"],
            raw: true
        });

        // Transactions by day
        const transactionsByDay = await Transactions.findAll({
            attributes: [
                [fn("DATE", col("transaction_date")), "date"],
                [fn("COUNT", col("id")), "count"]
            ],
            where: {
                transaction_date: { [Op.gte]: startDate }
            },
            group: [fn("DATE", col("transaction_date"))],
            order: [[fn("DATE", col("transaction_date")), "ASC"]],
            raw: true
        });

        // Most active users (employees with most checkouts)
        const mostActiveUsers = await Transactions.findAll({
            attributes: [
                [fn("COUNT", col("transactions.id")), "transaction_count"]
            ],
            include: [{
                association: "employee",
                attributes: ["uuid", "name", "department"]
            }],
            where: {
                action_type: "checkout",
                transaction_date: { [Op.gte]: startDate },
                user_id: { [Op.ne]: null }
            },
            group: ["user_id"],
            order: [[fn("COUNT", col("transactions.id")), "DESC"]],
            limit: 5,
            raw: true,
            nest: true
        });

        res.status(200).json({
            success: true,
            data: {
                period: `Last ${days} days`,
                transactionsByType: transactionsByType.map(item => ({
                    actionType: item.action_type,
                    count: parseInt(item.count)
                })),
                transactionsByDay: transactionsByDay.map(item => ({
                    date: item.date,
                    count: parseInt(item.count)
                })),
                mostActiveUsers: mostActiveUsers.map(item => ({
                    user: item.employee?.name || "Unknown",
                    department: item.employee?.department,
                    transactionCount: parseInt(item.transaction_count)
                }))
            }
        });
    } catch (error) {
        console.error("Get Activity Report Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
