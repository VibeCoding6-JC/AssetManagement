import { Op } from "sequelize";
import { Categories, Assets } from "../models/index.js";

/**
 * Get All Categories
 * GET /api/categories
 */
export const getCategories = async (req, res) => {
    try {
        const { search = "" } = req.query;

        const whereClause = {};
        if (search) {
            whereClause.name = { [Op.like]: `%${search}%` };
        }

        const categories = await Categories.findAll({
            where: whereClause,
            attributes: ["uuid", "name", "description", "created_at"],
            order: [["name", "ASC"]]
        });

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get Category by ID
 * GET /api/categories/:id
 */
export const getCategoryById = async (req, res) => {
    try {
        const category = await Categories.findOne({
            where: { uuid: req.params.id },
            attributes: ["uuid", "name", "description", "created_at", "updated_at"]
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Get asset count for this category
        const assetCount = await Assets.count({
            include: [{
                association: "category",
                where: { uuid: req.params.id }
            }]
        });

        res.status(200).json({
            success: true,
            data: {
                ...category.toJSON(),
                assetCount
            }
        });
    } catch (error) {
        console.error("Get Category Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Create New Category
 * POST /api/categories
 */
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        // Check if category already exists
        const existingCategory = await Categories.findOne({
            where: { name: { [Op.like]: name } }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists"
            });
        }

        const category = await Categories.create({ name, description });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: {
                uuid: category.uuid,
                name: category.name,
                description: category.description
            }
        });
    } catch (error) {
        console.error("Create Category Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Update Category
 * PUT /api/categories/:id
 */
export const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const category = await Categories.findOne({ where: { uuid: req.params.id } });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Check if new name conflicts with existing category
        if (name && name !== category.name) {
            const existingCategory = await Categories.findOne({
                where: { 
                    name: { [Op.like]: name },
                    id: { [Op.ne]: category.id }
                }
            });

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Category with this name already exists"
                });
            }
        }

        await Categories.update(
            { name: name || category.name, description },
            { where: { id: category.id } }
        );

        const updatedCategory = await Categories.findOne({
            where: { id: category.id },
            attributes: ["uuid", "name", "description"]
        });

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory
        });
    } catch (error) {
        console.error("Update Category Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Delete Category
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res) => {
    try {
        const category = await Categories.findOne({ where: { uuid: req.params.id } });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Check if category has assets
        const assetCount = await Assets.count({
            where: { category_id: category.id }
        });

        if (assetCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${assetCount} asset(s) are using this category.`
            });
        }

        await Categories.destroy({ where: { id: category.id } });

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.error("Delete Category Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
