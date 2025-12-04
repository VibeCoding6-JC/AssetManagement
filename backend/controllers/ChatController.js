import geminiService from "../services/GeminiService.js";
import queryBuilder from "../services/QueryBuilder.js";
import db from "../config/Database.js";

// Rate limiting storage (simple in-memory, use Redis for production)
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15;

/**
 * Check rate limit for a user
 */
const checkRateLimit = (userId) => {
    const now = Date.now();
    const userKey = `user_${userId}`;
    
    if (!rateLimits.has(userKey)) {
        rateLimits.set(userKey, { count: 1, windowStart: now });
        return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
    }
    
    const userLimit = rateLimits.get(userKey);
    
    // Reset window if expired
    if (now - userLimit.windowStart > RATE_LIMIT_WINDOW) {
        rateLimits.set(userKey, { count: 1, windowStart: now });
        return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
    }
    
    // Check limit
    if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
        const resetTime = Math.ceil((userLimit.windowStart + RATE_LIMIT_WINDOW - now) / 1000);
        return { allowed: false, remaining: 0, resetIn: resetTime };
    }
    
    // Increment count
    userLimit.count++;
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - userLimit.count };
};

/**
 * Main chat endpoint - Process natural language query
 */
export const chat = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.userId;

        // Validate input
        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Pesan tidak boleh kosong"
            });
        }

        if (message.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Pesan terlalu panjang (maksimal 1000 karakter)"
            });
        }

        // Check rate limit
        const rateCheck = checkRateLimit(userId);
        if (!rateCheck.allowed) {
            return res.status(429).json({
                success: false,
                message: `Terlalu banyak permintaan. Silakan tunggu ${rateCheck.resetIn} detik.`,
                resetIn: rateCheck.resetIn
            });
        }

        // Check if Gemini is configured
        if (!geminiService.isConfigured()) {
            return res.status(503).json({
                success: false,
                message: "Layanan AI belum dikonfigurasi"
            });
        }

        // Step 1: Generate SQL query from natural language
        let queryInfo;
        try {
            queryInfo = await geminiService.generateSQLQuery(message);
        } catch (error) {
            console.error("Error generating SQL:", error);
            // Fallback to general chat if SQL generation fails
            const generalResponse = await geminiService.generalChat(message);
            return res.json({
                success: true,
                data: {
                    type: "general",
                    message: generalResponse,
                    query: null
                },
                remaining: rateCheck.remaining
            });
        }

        // If AI says it can't answer with database query
        if (!queryInfo.can_answer) {
            const generalResponse = await geminiService.generalChat(message);
            return res.json({
                success: true,
                data: {
                    type: "general",
                    message: generalResponse,
                    query: null,
                    reason: queryInfo.explanation
                },
                remaining: rateCheck.remaining
            });
        }

        // Step 2: Validate and sanitize the SQL query
        const processedQuery = queryBuilder.processQuery(queryInfo.sql_query);
        
        if (!processedQuery.success) {
            console.warn("Query validation failed:", processedQuery.error);
            return res.json({
                success: true,
                data: {
                    type: "error",
                    message: `Maaf, saya tidak bisa memproses permintaan tersebut. ${processedQuery.error}`,
                    query: null
                },
                remaining: rateCheck.remaining
            });
        }

        // Step 3: Execute the query
        let queryResults;
        try {
            const [results] = await db.query(processedQuery.query);
            queryResults = results;
        } catch (dbError) {
            console.error("Database query error:", dbError);
            return res.json({
                success: true,
                data: {
                    type: "error",
                    message: "Maaf, terjadi kesalahan saat mengambil data. Silakan coba dengan pertanyaan yang berbeda.",
                    query: null
                },
                remaining: rateCheck.remaining
            });
        }

        // Step 4: Format the response using AI
        let formattedResponse;
        try {
            formattedResponse = await geminiService.formatResponse(message, queryResults, queryInfo);
        } catch (formatError) {
            console.error("Error formatting response:", formatError);
            // Return raw results if formatting fails
            formattedResponse = `Berikut hasil query:\n${JSON.stringify(queryResults, null, 2)}`;
        }

        return res.json({
            success: true,
            data: {
                type: "database",
                message: formattedResponse,
                query: processedQuery.query,
                resultCount: Array.isArray(queryResults) ? queryResults.length : 1,
                explanation: queryInfo.explanation
            },
            remaining: rateCheck.remaining
        });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan internal"
        });
    }
};

/**
 * Get chat status/info
 */
export const getStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const rateCheck = checkRateLimit(userId);
        
        // Don't count this as a request
        if (rateLimits.has(`user_${userId}`)) {
            rateLimits.get(`user_${userId}`).count--;
        }

        return res.json({
            success: true,
            data: {
                configured: geminiService.isConfigured(),
                rateLimit: {
                    remaining: rateCheck.remaining + 1,
                    maxPerMinute: MAX_REQUESTS_PER_WINDOW
                }
            }
        });
    } catch (error) {
        console.error("Get Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan internal"
        });
    }
};

/**
 * Get suggested questions
 */
export const getSuggestions = async (req, res) => {
    try {
        const suggestions = [
            "Berapa total asset yang ada?",
            "Asset apa saja yang sedang dalam perbaikan?",
            "Berapa nilai total asset kategori Laptop?",
            "Daftar asset yang tersedia di Gedung A",
            "Siapa saja user yang meminjam asset?",
            "Asset mana yang garansinya akan habis bulan ini?",
            "Berapa jumlah asset per kategori?",
            "Vendor mana yang paling banyak menyuplai asset?",
            "Daftar asset dengan kondisi 'poor'",
            "Riwayat transaksi asset minggu ini"
        ];

        return res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error("Get Suggestions Error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan internal"
        });
    }
};
