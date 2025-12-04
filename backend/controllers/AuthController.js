import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Users } from "../models/index.js";

/**
 * Login User
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user by email
        const user = await Users.findOne({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check if user has password (employees without login access don't have passwords)
        if (!user.password) {
            return res.status(403).json({
                success: false,
                message: "This account does not have login access"
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated. Please contact administrator."
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { uuid: user.uuid, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
        );

        const refreshToken = jwt.sign(
            { uuid: user.uuid },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "1d" }
        );

        // Save refresh token to database
        await Users.update(
            { refresh_token: refreshToken },
            { where: { id: user.id } }
        );

        // Set refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    uuid: user.uuid,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department
                },
                accessToken
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Logout User
 * DELETE /api/auth/logout
 */
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(204).send();
        }

        // Find user with this refresh token
        const user = await Users.findOne({
            where: { refresh_token: refreshToken }
        });

        if (!user) {
            res.clearCookie("refreshToken");
            return res.status(204).send();
        }

        // Clear refresh token in database
        await Users.update(
            { refresh_token: null },
            { where: { id: user.id } }
        );

        // Clear cookie
        res.clearCookie("refreshToken");

        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Refresh Access Token
 * GET /api/auth/token
 */
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found"
            });
        }

        // Find user with this refresh token
        const user = await Users.findOne({
            where: { refresh_token: refreshToken }
        });

        if (!user) {
            return res.status(403).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        // Verify refresh token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: "Refresh token has expired. Please login again."
                });
            }

            // Generate new access token
            const accessToken = jwt.sign(
                { uuid: user.uuid, role: user.role },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
            );

            res.status(200).json({
                success: true,
                data: {
                    accessToken
                }
            });
        });
    } catch (error) {
        console.error("Refresh Token Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get Current User Info
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
    try {
        const user = await Users.findOne({
            where: { uuid: req.userUuid },
            attributes: ["uuid", "name", "email", "role", "department", "phone", "is_active", "created_at"]
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
        console.error("Get Me Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
