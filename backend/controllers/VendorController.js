import { Op } from "sequelize";
import { Vendors, Assets } from "../models/index.js";

/**
 * Get All Vendors
 * GET /api/vendors
 */
export const getVendors = async (req, res) => {
    try {
        const { search = "" } = req.query;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { contact_person: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const vendors = await Vendors.findAll({
            where: whereClause,
            attributes: ["uuid", "name", "contact_person", "email", "phone", "address", "created_at"],
            order: [["name", "ASC"]]
        });

        res.status(200).json({
            success: true,
            data: vendors
        });
    } catch (error) {
        console.error("Get Vendors Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get Vendor by ID
 * GET /api/vendors/:id
 */
export const getVendorById = async (req, res) => {
    try {
        const vendor = await Vendors.findOne({
            where: { uuid: req.params.id },
            attributes: ["uuid", "name", "contact_person", "email", "phone", "address", "created_at", "updated_at"]
        });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }

        // Get asset count for this vendor
        const assetCount = await Assets.count({
            where: { vendor_id: vendor.id }
        });

        res.status(200).json({
            success: true,
            data: {
                ...vendor.toJSON(),
                assetCount
            }
        });
    } catch (error) {
        console.error("Get Vendor Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Create New Vendor
 * POST /api/vendors
 */
export const createVendor = async (req, res) => {
    try {
        const { name, contact_person, email, phone, address } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Vendor name is required"
            });
        }

        const vendor = await Vendors.create({ 
            name, 
            contact_person, 
            email, 
            phone, 
            address 
        });

        res.status(201).json({
            success: true,
            message: "Vendor created successfully",
            data: {
                uuid: vendor.uuid,
                name: vendor.name,
                contact_person: vendor.contact_person,
                email: vendor.email,
                phone: vendor.phone,
                address: vendor.address
            }
        });
    } catch (error) {
        console.error("Create Vendor Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Update Vendor
 * PUT /api/vendors/:id
 */
export const updateVendor = async (req, res) => {
    try {
        const { name, contact_person, email, phone, address } = req.body;

        const vendor = await Vendors.findOne({ where: { uuid: req.params.id } });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }

        await Vendors.update(
            { 
                name: name || vendor.name,
                contact_person: contact_person !== undefined ? contact_person : vendor.contact_person,
                email: email !== undefined ? email : vendor.email,
                phone: phone !== undefined ? phone : vendor.phone,
                address: address !== undefined ? address : vendor.address
            },
            { where: { id: vendor.id } }
        );

        const updatedVendor = await Vendors.findOne({
            where: { id: vendor.id },
            attributes: ["uuid", "name", "contact_person", "email", "phone", "address"]
        });

        res.status(200).json({
            success: true,
            message: "Vendor updated successfully",
            data: updatedVendor
        });
    } catch (error) {
        console.error("Update Vendor Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Delete Vendor
 * DELETE /api/vendors/:id
 */
export const deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendors.findOne({ where: { uuid: req.params.id } });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }

        // Check if vendor has assets
        const assetCount = await Assets.count({
            where: { vendor_id: vendor.id }
        });

        if (assetCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete vendor. ${assetCount} asset(s) are from this vendor.`
            });
        }

        await Vendors.destroy({ where: { id: vendor.id } });

        res.status(200).json({
            success: true,
            message: "Vendor deleted successfully"
        });
    } catch (error) {
        console.error("Delete Vendor Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
