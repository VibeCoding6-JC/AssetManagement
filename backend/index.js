import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Import database
import db from "./config/Database.js";

// Import routes
import AuthRoute from "./routes/AuthRoute.js";
import UserRoute from "./routes/UserRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js";
import LocationRoute from "./routes/LocationRoute.js";
import VendorRoute from "./routes/VendorRoute.js";
import AssetRoute from "./routes/AssetRoute.js";
import TransactionRoute from "./routes/TransactionRoute.js";
import DashboardRoute from "./routes/DashboardRoute.js";

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/categories", CategoryRoute);
app.use("/api/locations", LocationRoute);
app.use("/api/vendors", VendorRoute);
app.use("/api/assets", AssetRoute);
app.use("/api/transactions", TransactionRoute);
app.use("/api/dashboard", DashboardRoute);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "IT Asset Management API",
        version: "1.0.0",
        endpoints: {
            health: "/api/health",
            auth: "/api/auth",
            users: "/api/users",
            categories: "/api/categories",
            locations: "/api/locations",
            vendors: "/api/vendors",
            assets: "/api/assets",
            transactions: "/api/transactions",
            dashboard: "/api/dashboard"
        }
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found",
        path: req.originalUrl
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
});

// Database connection and server start
const startServer = async () => {
    try {
        await db.authenticate();
        console.log("✅ Database connected successfully");
        
        // Sync database (only in development)
        if (process.env.NODE_ENV === "development") {
            await db.sync({ alter: false });
            console.log("✅ Database synchronized");
        }
        
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📍 API URL: http://localhost:${PORT}`);
            console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
        });
    } catch (error) {
        console.error("❌ Unable to connect to database:", error.message);
        process.exit(1);
    }
};

startServer();
