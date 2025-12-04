import { DATABASE_SCHEMA } from "../config/dbSchema.js";

class QueryBuilder {
    constructor() {
        this.allowedTables = DATABASE_SCHEMA.allowedTables;
        this.restrictedColumns = DATABASE_SCHEMA.restrictedColumns;
        this.dangerousKeywords = [
            "DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE", 
            "TRUNCATE", "REPLACE", "GRANT", "REVOKE", "EXEC", "EXECUTE",
            "UNION", "--", ";--", "/*", "*/", "@@", "@",
            "CHAR(", "NCHAR(", "VARCHAR(", "NVARCHAR(",
            "WAITFOR", "DELAY", "BENCHMARK", "SLEEP",
            "LOAD_FILE", "INTO OUTFILE", "INTO DUMPFILE"
        ];
    }

    /**
     * Validate SQL query for security
     */
    validateQuery(sql) {
        if (!sql || typeof sql !== "string") {
            return { valid: false, error: "Query tidak valid" };
        }

        const upperSQL = sql.toUpperCase().trim();

        // 1. Must start with SELECT
        if (!upperSQL.startsWith("SELECT")) {
            return { valid: false, error: "Hanya query SELECT yang diizinkan" };
        }

        // 2. Check for dangerous keywords
        for (const keyword of this.dangerousKeywords) {
            if (upperSQL.includes(keyword.toUpperCase())) {
                return { valid: false, error: `Query mengandung operasi berbahaya: ${keyword}` };
            }
        }

        // 3. Check for multiple statements (semicolon injection)
        const statements = sql.split(";").filter(s => s.trim());
        if (statements.length > 1) {
            return { valid: false, error: "Multiple statements tidak diizinkan" };
        }

        // 4. Check for restricted columns
        for (const col of this.restrictedColumns) {
            const regex = new RegExp(`\\b${col}\\b`, "gi");
            if (regex.test(sql)) {
                return { valid: false, error: `Akses ke kolom '${col}' tidak diizinkan` };
            }
        }

        // 5. Validate table names
        const tableValidation = this.validateTables(sql);
        if (!tableValidation.valid) {
            return tableValidation;
        }

        // 6. Check for suspicious patterns
        const suspiciousPatterns = [
            /'\s*OR\s+'1'\s*=\s*'1/gi,  // OR '1'='1'
            /'\s*OR\s+1\s*=\s*1/gi,      // OR 1=1
            /'\s*;\s*--/gi,              // '; --
            /INFORMATION_SCHEMA/gi,       // Access to metadata
            /MYSQL\./gi,                  // Access to mysql system db
            /SYS\./gi                     // Access to sys schema
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(sql)) {
                return { valid: false, error: "Query mengandung pola mencurigakan" };
            }
        }

        return { valid: true };
    }

    /**
     * Validate that only allowed tables are accessed
     */
    validateTables(sql) {
        const upperSQL = sql.toUpperCase();
        
        // Extract table names from FROM and JOIN clauses
        const fromMatch = upperSQL.match(/FROM\s+(\w+)/gi) || [];
        const joinMatch = upperSQL.match(/JOIN\s+(\w+)/gi) || [];
        
        const allMatches = [...fromMatch, ...joinMatch];
        
        for (const match of allMatches) {
            const tableName = match.replace(/FROM\s+|JOIN\s+/gi, "").toLowerCase();
            if (!this.allowedTables.includes(tableName)) {
                return { valid: false, error: `Tabel '${tableName}' tidak diizinkan untuk diakses` };
            }
        }

        return { valid: true };
    }

    /**
     * Sanitize and prepare query for execution
     */
    sanitizeQuery(sql) {
        // Remove leading/trailing whitespace
        let sanitized = sql.trim();
        
        // Remove any trailing semicolons
        sanitized = sanitized.replace(/;+$/, "");
        
        // Ensure LIMIT clause exists (max 100)
        const upperSQL = sanitized.toUpperCase();
        if (!upperSQL.includes("LIMIT")) {
            sanitized += " LIMIT 100";
        } else {
            // Ensure limit is not more than 100
            const limitMatch = sanitized.match(/LIMIT\s+(\d+)/i);
            if (limitMatch) {
                const limitValue = parseInt(limitMatch[1]);
                if (limitValue > 100) {
                    sanitized = sanitized.replace(/LIMIT\s+\d+/i, "LIMIT 100");
                }
            }
        }

        return sanitized;
    }

    /**
     * Process and validate a query from AI
     */
    processQuery(sql) {
        // Validate first
        const validation = this.validateQuery(sql);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error,
                query: null
            };
        }

        // Sanitize
        const sanitizedQuery = this.sanitizeQuery(sql);

        return {
            success: true,
            query: sanitizedQuery,
            error: null
        };
    }
}

// Singleton instance
const queryBuilder = new QueryBuilder();
export default queryBuilder;
