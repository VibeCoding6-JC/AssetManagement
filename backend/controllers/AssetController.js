import { Op } from "sequelize";
import { Assets, Categories, Locations, Vendors, Users, Transactions } from "../models/index.js";

/**
 * Get All Assets
 * GET /api/assets
 */
export const getAssets = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = "",
            category = "",
            location = "",
            status = "",
            condition = ""
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Build where clause
        const whereClause = {};
        
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { asset_tag: { [Op.like]: `%${search}%` } },
                { serial_number: { [Op.like]: `%${search}%` } }
            ];
        }
        
        if (status) {
            whereClause.status = status;
        }
        
        if (condition) {
            whereClause.condition = condition;
        }

        // Build include for category and location filters
        const includeClause = [
            {
                association: "category",
                attributes: ["uuid", "name"],
                ...(category && { where: { uuid: category } })
            },
            {
                association: "location",
                attributes: ["uuid", "name"],
                ...(location && { where: { uuid: location } })
            },
            {
                association: "vendor",
                attributes: ["uuid", "name"],
                required: false
            },
            {
                association: "holder",
                attributes: ["uuid", "name", "email", "department"],
                required: false
            }
        ];

        const { count, rows } = await Assets.findAndCountAll({
            where: whereClause,
            include: includeClause,
            attributes: [
                "uuid", "name", "asset_tag", "serial_number", 
                "status", "condition", "purchase_date", "purchase_price",
                "warranty_expiry", "image_url", "created_at"
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: offset,
            distinct: true
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
        console.error("Get Assets Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get Asset by ID
 * GET /api/assets/:id
 */
export const getAssetById = async (req, res) => {
    try {
        const asset = await Assets.findOne({
            where: { uuid: req.params.id },
            include: [
                {
                    association: "category",
                    attributes: ["uuid", "name", "description"]
                },
                {
                    association: "location",
                    attributes: ["uuid", "name", "address"]
                },
                {
                    association: "vendor",
                    attributes: ["uuid", "name", "contact_person", "email", "phone"],
                    required: false
                },
                {
                    association: "holder",
                    attributes: ["uuid", "name", "email", "department", "phone"],
                    required: false
                }
            ]
        });

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.status(200).json({
            success: true,
            data: asset
        });
    } catch (error) {
        console.error("Get Asset Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Create New Asset
 * POST /api/assets
 */
export const createAsset = async (req, res) => {
    try {
        const {
            name,
            asset_tag,
            serial_number,
            category_id,
            location_id,
            vendor_id,
            status,
            condition,
            purchase_date,
            purchase_price,
            warranty_expiry,
            specifications,
            notes,
            image_url
        } = req.body;

        // Validate required fields
        if (!name || !asset_tag || !serial_number || !category_id || !location_id || !purchase_date) {
            return res.status(400).json({
                success: false,
                message: "Name, asset tag, serial number, category, location, and purchase date are required"
            });
        }

        // Check for duplicate asset_tag
        const existingTag = await Assets.findOne({ where: { asset_tag } });
        if (existingTag) {
            return res.status(400).json({
                success: false,
                message: "Asset tag already exists"
            });
        }

        // Check for duplicate serial_number
        const existingSerial = await Assets.findOne({ where: { serial_number } });
        if (existingSerial) {
            return res.status(400).json({
                success: false,
                message: "Serial number already exists"
            });
        }

        // Verify category exists
        const category = await Categories.findOne({ where: { uuid: category_id } });
        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category not found"
            });
        }

        // Verify location exists
        const location = await Locations.findOne({ where: { uuid: location_id } });
        if (!location) {
            return res.status(400).json({
                success: false,
                message: "Location not found"
            });
        }

        // Verify vendor exists if provided
        let vendorId = null;
        if (vendor_id) {
            const vendor = await Vendors.findOne({ where: { uuid: vendor_id } });
            if (!vendor) {
                return res.status(400).json({
                    success: false,
                    message: "Vendor not found"
                });
            }
            vendorId = vendor.id;
        }

        // Create asset
        const asset = await Assets.create({
            name,
            asset_tag,
            serial_number,
            category_id: category.id,
            location_id: location.id,
            vendor_id: vendorId,
            status: status || "available",
            condition: condition || "new",
            purchase_date,
            purchase_price: purchase_price || 0,
            warranty_expiry,
            specifications: specifications ? JSON.stringify(specifications) : null,
            notes,
            image_url
        });

        // Fetch created asset with relations
        const createdAsset = await Assets.findOne({
            where: { id: asset.id },
            include: [
                { association: "category", attributes: ["uuid", "name"] },
                { association: "location", attributes: ["uuid", "name"] },
                { association: "vendor", attributes: ["uuid", "name"], required: false }
            ]
        });

        res.status(201).json({
            success: true,
            message: "Asset created successfully",
            data: createdAsset
        });
    } catch (error) {
        console.error("Create Asset Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Update Asset
 * PUT /api/assets/:id
 */
export const updateAsset = async (req, res) => {
    try {
        const {
            name,
            asset_tag,
            serial_number,
            category_id,
            location_id,
            vendor_id,
            condition,
            purchase_date,
            purchase_price,
            warranty_expiry,
            specifications,
            notes,
            image_url
        } = req.body;

        const asset = await Assets.findOne({ where: { uuid: req.params.id } });
        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        // Check for duplicate asset_tag if changed
        if (asset_tag && asset_tag !== asset.asset_tag) {
            const existingTag = await Assets.findOne({ 
                where: { 
                    asset_tag,
                    id: { [Op.ne]: asset.id }
                } 
            });
            if (existingTag) {
                return res.status(400).json({
                    success: false,
                    message: "Asset tag already exists"
                });
            }
        }

        // Check for duplicate serial_number if changed
        if (serial_number && serial_number !== asset.serial_number) {
            const existingSerial = await Assets.findOne({ 
                where: { 
                    serial_number,
                    id: { [Op.ne]: asset.id }
                } 
            });
            if (existingSerial) {
                return res.status(400).json({
                    success: false,
                    message: "Serial number already exists"
                });
            }
        }

        // Prepare update data
        const updateData = {};
        if (name) updateData.name = name;
        if (asset_tag) updateData.asset_tag = asset_tag;
        if (serial_number) updateData.serial_number = serial_number;
        if (condition) updateData.condition = condition;
        if (purchase_date) updateData.purchase_date = purchase_date;
        if (purchase_price !== undefined) updateData.purchase_price = purchase_price;
        if (warranty_expiry !== undefined) updateData.warranty_expiry = warranty_expiry;
        if (specifications !== undefined) updateData.specifications = JSON.stringify(specifications);
        if (notes !== undefined) updateData.notes = notes;
        if (image_url !== undefined) updateData.image_url = image_url;

        // Handle category update
        if (category_id) {
            const category = await Categories.findOne({ where: { uuid: category_id } });
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: "Category not found"
                });
            }
            updateData.category_id = category.id;
        }

        // Handle location update
        if (location_id) {
            const location = await Locations.findOne({ where: { uuid: location_id } });
            if (!location) {
                return res.status(400).json({
                    success: false,
                    message: "Location not found"
                });
            }
            updateData.location_id = location.id;
        }

        // Handle vendor update
        if (vendor_id !== undefined) {
            if (vendor_id === null || vendor_id === "") {
                updateData.vendor_id = null;
            } else {
                const vendor = await Vendors.findOne({ where: { uuid: vendor_id } });
                if (!vendor) {
                    return res.status(400).json({
                        success: false,
                        message: "Vendor not found"
                    });
                }
                updateData.vendor_id = vendor.id;
            }
        }

        await Assets.update(updateData, { where: { id: asset.id } });

        // Fetch updated asset
        const updatedAsset = await Assets.findOne({
            where: { id: asset.id },
            include: [
                { association: "category", attributes: ["uuid", "name"] },
                { association: "location", attributes: ["uuid", "name"] },
                { association: "vendor", attributes: ["uuid", "name"], required: false },
                { association: "holder", attributes: ["uuid", "name"], required: false }
            ]
        });

        res.status(200).json({
            success: true,
            message: "Asset updated successfully",
            data: updatedAsset
        });
    } catch (error) {
        console.error("Update Asset Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Delete Asset
 * DELETE /api/assets/:id
 */
export const deleteAsset = async (req, res) => {
    try {
        const asset = await Assets.findOne({ where: { uuid: req.params.id } });
        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        // Check if asset is assigned
        if (asset.status === "assigned") {
            return res.status(400).json({
                success: false,
                message: "Cannot delete assigned asset. Please check-in the asset first."
            });
        }

        // Soft delete - mark as retired
        await Assets.update(
            { status: "retired" },
            { where: { id: asset.id } }
        );

        res.status(200).json({
            success: true,
            message: "Asset retired successfully"
        });
    } catch (error) {
        console.error("Delete Asset Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get Asset History
 * GET /api/assets/:id/history
 */
export const getAssetHistory = async (req, res) => {
    try {
        const asset = await Assets.findOne({ where: { uuid: req.params.id } });
        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        const transactions = await Transactions.findAll({
            where: { asset_id: asset.id },
            include: [
                {
                    association: "employee",
                    attributes: ["uuid", "name", "email", "department"]
                },
                {
                    association: "admin",
                    attributes: ["uuid", "name", "email"]
                }
            ],
            order: [["transaction_date", "DESC"]]
        });

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error("Get Asset History Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
