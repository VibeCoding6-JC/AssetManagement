import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { Users, Assets } from "../models/index.js";

/**
 * Get All Users
 * GET /api/users
 */
export const getUsers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = "", 
            role = "",
            department = "",
            is_active = ""
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Build where clause
        const whereClause = {};
        
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }
        
        if (role) {
            whereClause.role = role;
        }
        
        if (department) {
            whereClause.department = { [Op.like]: `%${department}%` };
        }
        
        if (is_active !== "") {
            whereClause.is_active = is_active === "true";
        }

        const { count, rows } = await Users.findAndCountAll({
            where: whereClause,
            attributes: ["uuid", "name", "email", "role", "department", "phone", "is_active", "created_at"],
            order: [["created_at", "DESC"]],
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
        console.error("Get Users Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get User by ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
    try {
        const user = await Users.findOne({
            where: { uuid: req.params.id },
            attributes: ["uuid", "name", "email", "role", "department", "phone", "is_active", "created_at", "updated_at"]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Get User Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Create New User
 * POST /api/users
 */
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, department, phone } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }

        // Check if email already exists
        const existingUser = await Users.findOne({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password if provided
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Create user
        const user = await Users.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || "employee",
            department,
            phone
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                uuid: user.uuid,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error("Create User Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Update User
 * PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
    try {
        const { name, email, password, role, department, phone, is_active } = req.body;

        // Find user
        const user = await Users.findOne({ where: { uuid: req.params.id } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if email is being changed and already exists
        if (email && email.toLowerCase() !== user.email) {
            const existingUser = await Users.findOne({ 
                where: { 
                    email: email.toLowerCase(),
                    id: { [Op.ne]: user.id }
                } 
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use"
                });
            }
        }

        // Prepare update data
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email.toLowerCase();
        if (role) updateData.role = role;
        if (department !== undefined) updateData.department = department;
        if (phone !== undefined) updateData.phone = phone;
        if (is_active !== undefined) updateData.is_active = is_active;
        
        // Hash new password if provided
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await Users.update(updateData, { where: { id: user.id } });

        // Fetch updated user
        const updatedUser = await Users.findOne({
            where: { id: user.id },
            attributes: ["uuid", "name", "email", "role", "department", "phone", "is_active"]
        });

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Delete User (Soft delete by deactivating)
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
    try {
        const user = await Users.findOne({ where: { uuid: req.params.id } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if user has assigned assets
        const assignedAssets = await Assets.count({
            where: { current_holder_id: user.id }
        });

        if (assignedAssets > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete user. User has ${assignedAssets} assigned asset(s). Please check-in all assets first.`
            });
        }

        // Soft delete - deactivate user
        await Users.update(
            { is_active: false },
            { where: { id: user.id } }
        );

        res.status(200).json({
            success: true,
            message: "User deactivated successfully"
        });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get Assets Held by User
 * GET /api/users/:id/assets
 */
export const getUserAssets = async (req, res) => {
    try {
        const user = await Users.findOne({ where: { uuid: req.params.id } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const assets = await Assets.findAll({
            where: { current_holder_id: user.id },
            attributes: ["uuid", "name", "asset_tag", "serial_number", "status", "condition"],
            include: [
                {
                    association: "category",
                    attributes: ["uuid", "name"]
                },
                {
                    association: "location",
                    attributes: ["uuid", "name"]
                }
            ]
        });

        res.status(200).json({
            success: true,
            data: assets
        });
    } catch (error) {
        console.error("Get User Assets Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
