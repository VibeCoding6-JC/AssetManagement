/**
 * Database Schema Configuration for AI Chat
 * This file provides schema information to Gemini AI for generating accurate SQL queries
 */

export const DATABASE_SCHEMA = {
    tables: {
        assets: {
            description: "Tabel utama yang menyimpan data asset/inventaris IT",
            columns: {
                id: { type: "INT", description: "Primary key" },
                uuid: { type: "VARCHAR(36)", description: "UUID unik asset" },
                asset_code: { type: "VARCHAR(20)", description: "Kode asset unik (format: AST-XXXXXX)" },
                name: { type: "VARCHAR(255)", description: "Nama asset" },
                description: { type: "TEXT", description: "Deskripsi detail asset" },
                category_id: { type: "INT", description: "Foreign key ke tabel categories" },
                location_id: { type: "INT", description: "Foreign key ke tabel locations" },
                vendor_id: { type: "INT", description: "Foreign key ke tabel vendors (nullable)" },
                brand: { type: "VARCHAR(100)", description: "Merek/brand asset" },
                model: { type: "VARCHAR(100)", description: "Model asset" },
                serial_number: { type: "VARCHAR(100)", description: "Nomor seri asset" },
                purchase_date: { type: "DATE", description: "Tanggal pembelian" },
                purchase_price: { type: "DECIMAL(15,2)", description: "Harga pembelian dalam Rupiah" },
                warranty_expired: { type: "DATE", description: "Tanggal berakhir garansi" },
                status: { 
                    type: "ENUM", 
                    values: ["available", "in_use", "maintenance", "disposed"],
                    description: "Status asset: available=tersedia, in_use=sedang digunakan, maintenance=perbaikan, disposed=dibuang/rusak"
                },
                condition: {
                    type: "ENUM",
                    values: ["new", "good", "fair", "poor"],
                    description: "Kondisi asset: new=baru, good=baik, fair=cukup, poor=buruk"
                },
                assigned_to: { type: "INT", description: "Foreign key ke tabel users (nullable) - user yang menggunakan asset" },
                notes: { type: "TEXT", description: "Catatan tambahan" },
                image: { type: "VARCHAR(255)", description: "Path gambar asset" },
                createdAt: { type: "DATETIME", description: "Tanggal dibuat" },
                updatedAt: { type: "DATETIME", description: "Tanggal terakhir diupdate" }
            }
        },
        categories: {
            description: "Tabel kategori asset",
            columns: {
                id: { type: "INT", description: "Primary key" },
                uuid: { type: "VARCHAR(36)", description: "UUID unik kategori" },
                name: { type: "VARCHAR(100)", description: "Nama kategori (contoh: Laptop, Monitor, Printer)" },
                description: { type: "TEXT", description: "Deskripsi kategori" },
                createdAt: { type: "DATETIME", description: "Tanggal dibuat" },
                updatedAt: { type: "DATETIME", description: "Tanggal terakhir diupdate" }
            }
        },
        locations: {
            description: "Tabel lokasi penyimpanan asset",
            columns: {
                id: { type: "INT", description: "Primary key" },
                uuid: { type: "VARCHAR(36)", description: "UUID unik lokasi" },
                name: { type: "VARCHAR(100)", description: "Nama lokasi (contoh: Gedung A, Lantai 2, Ruang IT)" },
                building: { type: "VARCHAR(100)", description: "Nama gedung" },
                floor: { type: "VARCHAR(20)", description: "Lantai" },
                room: { type: "VARCHAR(100)", description: "Nama ruangan" },
                description: { type: "TEXT", description: "Deskripsi lokasi" },
                createdAt: { type: "DATETIME", description: "Tanggal dibuat" },
                updatedAt: { type: "DATETIME", description: "Tanggal terakhir diupdate" }
            }
        },
        vendors: {
            description: "Tabel vendor/supplier asset",
            columns: {
                id: { type: "INT", description: "Primary key" },
                uuid: { type: "VARCHAR(36)", description: "UUID unik vendor" },
                name: { type: "VARCHAR(100)", description: "Nama vendor/perusahaan" },
                contact_person: { type: "VARCHAR(100)", description: "Nama kontak person" },
                email: { type: "VARCHAR(100)", description: "Email vendor" },
                phone: { type: "VARCHAR(20)", description: "Nomor telepon" },
                address: { type: "TEXT", description: "Alamat vendor" },
                description: { type: "TEXT", description: "Deskripsi vendor" },
                createdAt: { type: "DATETIME", description: "Tanggal dibuat" },
                updatedAt: { type: "DATETIME", description: "Tanggal terakhir diupdate" }
            }
        },
        users: {
            description: "Tabel pengguna sistem",
            columns: {
                id: { type: "INT", description: "Primary key" },
                uuid: { type: "VARCHAR(36)", description: "UUID unik user" },
                name: { type: "VARCHAR(100)", description: "Nama lengkap user" },
                email: { type: "VARCHAR(100)", description: "Email user" },
                role: { 
                    type: "ENUM", 
                    values: ["admin", "staff"],
                    description: "Role user: admin=administrator, staff=staff biasa"
                },
                department: { type: "VARCHAR(100)", description: "Departemen user" },
                phone: { type: "VARCHAR(20)", description: "Nomor telepon" },
                is_active: { type: "BOOLEAN", description: "Status aktif user" },
                createdAt: { type: "DATETIME", description: "Tanggal dibuat" },
                updatedAt: { type: "DATETIME", description: "Tanggal terakhir diupdate" }
            },
            restricted_columns: ["password", "refresh_token"] // Tidak boleh diakses
        },
        transactions: {
            description: "Tabel transaksi/riwayat penggunaan asset",
            columns: {
                id: { type: "INT", description: "Primary key" },
                uuid: { type: "VARCHAR(36)", description: "UUID unik transaksi" },
                asset_id: { type: "INT", description: "Foreign key ke tabel assets" },
                user_id: { type: "INT", description: "Foreign key ke tabel users - user yang melakukan transaksi" },
                type: { 
                    type: "ENUM", 
                    values: ["assignment", "return", "maintenance", "disposal"],
                    description: "Tipe transaksi: assignment=penugasan, return=pengembalian, maintenance=perbaikan, disposal=pembuangan"
                },
                assigned_to: { type: "INT", description: "Foreign key ke tabel users - user yang menerima asset (untuk assignment)" },
                transaction_date: { type: "DATE", description: "Tanggal transaksi" },
                return_date: { type: "DATE", description: "Tanggal pengembalian (nullable)" },
                notes: { type: "TEXT", description: "Catatan transaksi" },
                createdAt: { type: "DATETIME", description: "Tanggal dibuat" },
                updatedAt: { type: "DATETIME", description: "Tanggal terakhir diupdate" }
            }
        }
    },
    
    relationships: [
        { from: "assets.category_id", to: "categories.id", type: "many-to-one" },
        { from: "assets.location_id", to: "locations.id", type: "many-to-one" },
        { from: "assets.vendor_id", to: "vendors.id", type: "many-to-one" },
        { from: "assets.assigned_to", to: "users.id", type: "many-to-one" },
        { from: "transactions.asset_id", to: "assets.id", type: "many-to-one" },
        { from: "transactions.user_id", to: "users.id", type: "many-to-one" },
        { from: "transactions.assigned_to", to: "users.id", type: "many-to-one" }
    ],

    // Tables that are allowed to be queried
    allowedTables: ["assets", "categories", "locations", "vendors", "users", "transactions"],
    
    // Columns that should never be exposed
    restrictedColumns: ["password", "refresh_token"],
    
    // Only SELECT operations are allowed
    allowedOperations: ["SELECT"]
};

/**
 * Generate schema description for AI prompt
 */
export const generateSchemaPrompt = () => {
    let prompt = "DATABASE SCHEMA:\n\n";
    
    for (const [tableName, tableInfo] of Object.entries(DATABASE_SCHEMA.tables)) {
        prompt += `TABLE: ${tableName}\n`;
        prompt += `Description: ${tableInfo.description}\n`;
        prompt += "Columns:\n";
        
        for (const [colName, colInfo] of Object.entries(tableInfo.columns)) {
            if (tableInfo.restricted_columns?.includes(colName)) continue;
            
            let colDesc = `  - ${colName} (${colInfo.type})`;
            if (colInfo.values) {
                colDesc += ` [values: ${colInfo.values.join(", ")}]`;
            }
            colDesc += `: ${colInfo.description}`;
            prompt += colDesc + "\n";
        }
        prompt += "\n";
    }
    
    prompt += "RELATIONSHIPS:\n";
    for (const rel of DATABASE_SCHEMA.relationships) {
        prompt += `  - ${rel.from} -> ${rel.to} (${rel.type})\n`;
    }
    
    return prompt;
};

export default DATABASE_SCHEMA;
