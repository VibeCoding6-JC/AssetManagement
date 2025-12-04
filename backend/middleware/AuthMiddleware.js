import jwt from "jsonwebtoken";
import { Users } from "../models/index.js";

/**
 * Verify JWT Access Token
 */
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access token is required"
            });
        }

        const token = authHeader.split(" ")[1];
        
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: err.name === "TokenExpiredError" 
                        ? "Access token has expired" 
                        : "Invalid access token"
                });
            }

            // Get user from database
            const user = await Users.findOne({
                where: { uuid: decoded.uuid },
                attributes: ["id", "uuid", "name", "email", "role", "department", "is_active"]
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }

            if (!user.is_active) {
                return res.status(403).json({
                    success: false,
                    message: "User account is deactivated"
                });
            }

            // Attach user to request object
            req.user = user;
            req.userId = user.id;
            req.userUuid = user.uuid;
            req.userRole = user.role;
            
            next();
        });
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Admin Only Middleware
 */
export const adminOnly = (req, res, next) => {
    if (req.userRole !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }
    next();
};

/**
 * Staff or Admin Middleware
 */
export const staffOrAdmin = (req, res, next) => {
    if (req.userRole !== "admin" && req.userRole !== "staff") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Staff or Admin privileges required."
        });
    }
    next();
};
