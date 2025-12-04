import { Op } from "sequelize";
import { Locations, Assets } from "../models/index.js";

/**
 * Get All Locations
 * GET /api/locations
 */
export const getLocations = async (req, res) => {
    try {
        const { search = "" } = req.query;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { address: { [Op.like]: `%${search}%` } }
            ];
        }

        const locations = await Locations.findAll({
            where: whereClause,
            attributes: ["uuid", "name", "address", "description", "created_at"],
            order: [["name", "ASC"]]
        });

        res.status(200).json({
            success: true,
            data: locations
        });
    } catch (error) {
        console.error("Get Locations Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get Location by ID
 * GET /api/locations/:id
 */
export const getLocationById = async (req, res) => {
    try {
        const location = await Locations.findOne({
            where: { uuid: req.params.id },
            attributes: ["uuid", "name", "address", "description", "created_at", "updated_at"]
        });

        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Location not found"
            });
        }

        // Get asset count for this location
        const assetCount = await Assets.count({
            where: { location_id: location.id }
        });

        res.status(200).json({
            success: true,
            data: {
                ...location.toJSON(),
                assetCount
            }
        });
    } catch (error) {
        console.error("Get Location Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Create New Location
 * POST /api/locations
 */
export const createLocation = async (req, res) => {
    try {
        const { name, address, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Location name is required"
            });
        }

        // Check if location already exists
        const existingLocation = await Locations.findOne({
            where: { name: { [Op.like]: name } }
        });

        if (existingLocation) {
            return res.status(400).json({
                success: false,
                message: "Location with this name already exists"
            });
        }

        const location = await Locations.create({ name, address, description });

        res.status(201).json({
            success: true,
            message: "Location created successfully",
            data: {
                uuid: location.uuid,
                name: location.name,
                address: location.address,
                description: location.description
            }
        });
    } catch (error) {
        console.error("Create Location Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Update Location
 * PUT /api/locations/:id
 */
export const updateLocation = async (req, res) => {
    try {
        const { name, address, description } = req.body;

        const location = await Locations.findOne({ where: { uuid: req.params.id } });
        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Location not found"
            });
        }

        // Check if new name conflicts with existing location
        if (name && name !== location.name) {
            const existingLocation = await Locations.findOne({
                where: { 
                    name: { [Op.like]: name },
                    id: { [Op.ne]: location.id }
                }
            });

            if (existingLocation) {
                return res.status(400).json({
                    success: false,
                    message: "Location with this name already exists"
                });
            }
        }

        await Locations.update(
            { 
                name: name || location.name, 
                address: address !== undefined ? address : location.address,
                description: description !== undefined ? description : location.description
            },
            { where: { id: location.id } }
        );

        const updatedLocation = await Locations.findOne({
            where: { id: location.id },
            attributes: ["uuid", "name", "address", "description"]
        });

        res.status(200).json({
            success: true,
            message: "Location updated successfully",
            data: updatedLocation
        });
    } catch (error) {
        console.error("Update Location Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Delete Location
 * DELETE /api/locations/:id
 */
export const deleteLocation = async (req, res) => {
    try {
        const location = await Locations.findOne({ where: { uuid: req.params.id } });
        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Location not found"
            });
        }

        // Check if location has assets
        const assetCount = await Assets.count({
            where: { location_id: location.id }
        });

        if (assetCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete location. ${assetCount} asset(s) are in this location.`
            });
        }

        await Locations.destroy({ where: { id: location.id } });

        res.status(200).json({
            success: true,
            message: "Location deleted successfully"
        });
    } catch (error) {
        console.error("Delete Location Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
