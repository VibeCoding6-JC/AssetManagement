import bcrypt from "bcrypt";
import db from "../config/Database.js";
import { Users, Categories, Locations, Vendors, Assets } from "../models/index.js";

const seed = async () => {
    try {
        console.log("🌱 Starting database seeding...");
        
        // Sync database (create tables)
        await db.sync({ force: true });
        console.log("✅ Database synchronized (tables recreated)");

        // ============================================
        // SEED USERS
        // ============================================
        const hashedPassword = await bcrypt.hash("admin123", 10);
        
        const users = await Users.bulkCreate([
            {
                name: "Super Admin",
                email: "admin@company.com",
                password: hashedPassword,
                role: "admin",
                department: "IT Department",
                phone: "021-1234567",
                is_active: true
            },
            {
                name: "IT Staff",
                email: "staff@company.com",
                password: hashedPassword,
                role: "staff",
                department: "IT Department",
                phone: "021-1234568",
                is_active: true
            },
            {
                name: "John Doe",
                email: "john.doe@company.com",
                password: null,
                role: "employee",
                department: "Engineering",
                phone: "021-1111111",
                is_active: true
            },
            {
                name: "Jane Smith",
                email: "jane.smith@company.com",
                password: null,
                role: "employee",
                department: "Finance",
                phone: "021-2222222",
                is_active: true
            },
            {
                name: "Bob Wilson",
                email: "bob.wilson@company.com",
                password: null,
                role: "employee",
                department: "Marketing",
                phone: "021-3333333",
                is_active: true
            },
            {
                name: "Alice Johnson",
                email: "alice.johnson@company.com",
                password: null,
                role: "employee",
                department: "HR",
                phone: "021-4444444",
                is_active: true
            }
        ]);
        console.log(`✅ Created ${users.length} users`);

        // ============================================
        // SEED CATEGORIES
        // ============================================
        const categories = await Categories.bulkCreate([
            { name: "Laptop", description: "Portable computers including notebooks and ultrabooks" },
            { name: "Desktop", description: "Desktop computers and workstations" },
            { name: "Server", description: "Server hardware and rack equipment" },
            { name: "Monitor", description: "Display monitors and screens" },
            { name: "Printer", description: "Printers, scanners, and multifunction devices" },
            { name: "Network Device", description: "Routers, switches, access points, and network equipment" },
            { name: "Software License", description: "Software licenses and subscriptions" },
            { name: "Peripheral", description: "Keyboards, mice, webcams, and other peripherals" },
            { name: "Mobile Device", description: "Smartphones and tablets" },
            { name: "Storage", description: "External drives, NAS, and storage devices" }
        ]);
        console.log(`✅ Created ${categories.length} categories`);

        // ============================================
        // SEED LOCATIONS
        // ============================================
        const locations = await Locations.bulkCreate([
            { name: "HQ - Server Room", address: "Gedung Utama Lt. 1", description: "Main server room at headquarters" },
            { name: "HQ - IT Storage", address: "Gedung Utama Lt. 1", description: "IT equipment storage room" },
            { name: "HQ - Floor 2", address: "Gedung Utama Lt. 2", description: "Engineering department floor" },
            { name: "HQ - Floor 3", address: "Gedung Utama Lt. 3", description: "Finance and HR department floor" },
            { name: "HQ - Floor 4", address: "Gedung Utama Lt. 4", description: "Marketing and Sales floor" },
            { name: "Branch Office - Surabaya", address: "Jl. Pemuda No. 123, Surabaya", description: "Surabaya branch office" },
            { name: "Branch Office - Bandung", address: "Jl. Asia Afrika No. 456, Bandung", description: "Bandung branch office" },
            { name: "Warehouse A", address: "Jl. Industri No. 789", description: "Main warehouse for bulk storage" }
        ]);
        console.log(`✅ Created ${locations.length} locations`);

        // ============================================
        // SEED VENDORS
        // ============================================
        const vendors = await Vendors.bulkCreate([
            { 
                name: "PT. Lenovo Indonesia", 
                contact_person: "Ahmad Wijaya",
                email: "sales@lenovo.co.id",
                phone: "021-5555001",
                address: "Jl. TB Simatupang, Jakarta Selatan"
            },
            { 
                name: "PT. Dell Indonesia", 
                contact_person: "Budi Santoso",
                email: "enterprise@dell.co.id",
                phone: "021-5555002",
                address: "Jl. Sudirman, Jakarta Pusat"
            },
            { 
                name: "PT. HP Indonesia", 
                contact_person: "Citra Dewi",
                email: "corporate@hp.co.id",
                phone: "021-5555003",
                address: "Jl. Gatot Subroto, Jakarta Selatan"
            },
            { 
                name: "PT. Cisco Systems Indonesia", 
                contact_person: "David Lim",
                email: "sales@cisco.co.id",
                phone: "021-5555004",
                address: "Jl. Kuningan, Jakarta Selatan"
            },
            { 
                name: "Microsoft Indonesia", 
                contact_person: "Eka Putri",
                email: "licensing@microsoft.co.id",
                phone: "021-5555005",
                address: "Jl. Jend. Sudirman, Jakarta"
            },
            { 
                name: "PT. Apple Indonesia", 
                contact_person: "Fajar Rahman",
                email: "business@apple.co.id",
                phone: "021-5555006",
                address: "Pacific Place, Jakarta"
            }
        ]);
        console.log(`✅ Created ${vendors.length} vendors`);

        // ============================================
        // SEED SAMPLE ASSETS
        // ============================================
        const assets = await Assets.bulkCreate([
            {
                name: "MacBook Pro 14 M3 Pro",
                asset_tag: "AST-LP-001",
                serial_number: "C02XL2THJGH5",
                category_id: 1, // Laptop
                location_id: 2, // IT Storage
                vendor_id: 6, // Apple
                current_holder_id: null,
                status: "available",
                condition: "new",
                purchase_date: "2024-01-15",
                purchase_price: 35000000.00,
                warranty_expiry: "2027-01-15",
                specifications: JSON.stringify({
                    processor: "Apple M3 Pro",
                    ram: "18GB",
                    storage: "512GB SSD",
                    display: "14.2 inch Liquid Retina XDR"
                }),
                notes: "For senior developers"
            },
            {
                name: "ThinkPad X1 Carbon Gen 11",
                asset_tag: "AST-LP-002",
                serial_number: "PF3KXYZ1",
                category_id: 1, // Laptop
                location_id: 3, // Floor 2
                vendor_id: 1, // Lenovo
                current_holder_id: 3, // John Doe
                status: "assigned",
                condition: "good",
                purchase_date: "2023-06-20",
                purchase_price: 28000000.00,
                warranty_expiry: "2026-06-20",
                specifications: JSON.stringify({
                    processor: "Intel Core i7-1365U",
                    ram: "16GB",
                    storage: "512GB SSD",
                    display: "14 inch 2.8K OLED"
                }),
                notes: "Assigned to John Doe - Engineering"
            },
            {
                name: "Dell OptiPlex 7090",
                asset_tag: "AST-DT-001",
                serial_number: "DELL7090ABC",
                category_id: 2, // Desktop
                location_id: 4, // Floor 3
                vendor_id: 2, // Dell
                current_holder_id: 4, // Jane Smith
                status: "assigned",
                condition: "good",
                purchase_date: "2023-03-10",
                purchase_price: 18000000.00,
                warranty_expiry: "2026-03-10",
                specifications: JSON.stringify({
                    processor: "Intel Core i7-11700",
                    ram: "32GB",
                    storage: "1TB SSD",
                    graphics: "Intel UHD 750"
                }),
                notes: "Finance department workstation"
            },
            {
                name: "Dell PowerEdge R750",
                asset_tag: "AST-SRV-001",
                serial_number: "SVR750XYZ123",
                category_id: 3, // Server
                location_id: 1, // Server Room
                vendor_id: 2, // Dell
                current_holder_id: null,
                status: "available",
                condition: "good",
                purchase_date: "2022-11-01",
                purchase_price: 150000000.00,
                warranty_expiry: "2025-11-01",
                specifications: JSON.stringify({
                    processor: "2x Intel Xeon Gold 5318Y",
                    ram: "256GB ECC",
                    storage: "8x 1.92TB SSD RAID",
                    network: "4x 10GbE"
                }),
                notes: "Production database server"
            },
            {
                name: 'LG UltraFine 27" 4K',
                asset_tag: "AST-MON-001",
                serial_number: "LG27UF001",
                category_id: 4, // Monitor
                location_id: 2, // IT Storage
                vendor_id: null,
                current_holder_id: null,
                status: "available",
                condition: "new",
                purchase_date: "2024-02-01",
                purchase_price: 8500000.00,
                warranty_expiry: "2027-02-01",
                specifications: JSON.stringify({
                    size: "27 inch",
                    resolution: "3840 x 2160",
                    panel: "IPS",
                    ports: "USB-C, HDMI, DisplayPort"
                }),
                notes: "4K monitor for design team"
            },
            {
                name: "HP LaserJet Pro M428fdw",
                asset_tag: "AST-PRT-001",
                serial_number: "HPLJ428001",
                category_id: 5, // Printer
                location_id: 4, // Floor 3
                vendor_id: 3, // HP
                current_holder_id: null,
                status: "available",
                condition: "good",
                purchase_date: "2023-08-15",
                purchase_price: 7500000.00,
                warranty_expiry: "2025-08-15",
                specifications: JSON.stringify({
                    type: "Multifunction Laser",
                    print_speed: "38 ppm",
                    duplex: "Yes",
                    wireless: "Yes"
                }),
                notes: "Shared printer for Floor 3"
            },
            {
                name: "Cisco Catalyst 9300-48P",
                asset_tag: "AST-NET-001",
                serial_number: "FCW2345L0AB",
                category_id: 6, // Network Device
                location_id: 1, // Server Room
                vendor_id: 4, // Cisco
                current_holder_id: null,
                status: "available",
                condition: "good",
                purchase_date: "2022-05-20",
                purchase_price: 85000000.00,
                warranty_expiry: "2025-05-20",
                specifications: JSON.stringify({
                    type: "Layer 3 Switch",
                    ports: "48x 1GbE PoE+",
                    uplink: "4x 10G SFP+",
                    poe_budget: "437W"
                }),
                notes: "Core switch for HQ"
            },
            {
                name: "Microsoft 365 E5 License",
                asset_tag: "AST-SW-001",
                serial_number: "MS365E5-2024-001",
                category_id: 7, // Software License
                location_id: 2, // IT Storage (virtual)
                vendor_id: 5, // Microsoft
                current_holder_id: null,
                status: "available",
                condition: "new",
                purchase_date: "2024-01-01",
                purchase_price: 5000000.00,
                warranty_expiry: "2025-01-01",
                specifications: JSON.stringify({
                    type: "Subscription",
                    seats: "100",
                    features: "Full E5 suite with Security"
                }),
                notes: "Annual enterprise license - 100 seats"
            },
            {
                name: "Logitech MX Master 3S",
                asset_tag: "AST-PRF-001",
                serial_number: "LGMX3S001",
                category_id: 8, // Peripheral
                location_id: 2, // IT Storage
                vendor_id: null,
                current_holder_id: null,
                status: "available",
                condition: "new",
                purchase_date: "2024-03-01",
                purchase_price: 1500000.00,
                warranty_expiry: "2026-03-01",
                specifications: JSON.stringify({
                    type: "Wireless Mouse",
                    connectivity: "Bluetooth, USB Receiver",
                    battery: "Rechargeable"
                }),
                notes: "Premium wireless mouse"
            },
            {
                name: "ThinkPad T14 Gen 4 - Under Repair",
                asset_tag: "AST-LP-003",
                serial_number: "PF4REPAIR1",
                category_id: 1, // Laptop
                location_id: 2, // IT Storage
                vendor_id: 1, // Lenovo
                current_holder_id: null,
                status: "repair",
                condition: "poor",
                purchase_date: "2022-09-01",
                purchase_price: 22000000.00,
                warranty_expiry: "2025-09-01",
                specifications: JSON.stringify({
                    processor: "Intel Core i5-1345U",
                    ram: "16GB",
                    storage: "256GB SSD"
                }),
                notes: "Screen replacement in progress - sent to vendor"
            }
        ]);
        console.log(`✅ Created ${assets.length} assets`);

        console.log("\n========================================");
        console.log("🎉 Database seeding completed successfully!");
        console.log("========================================");
        console.log("\n📋 Summary:");
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Categories: ${categories.length}`);
        console.log(`   - Locations: ${locations.length}`);
        console.log(`   - Vendors: ${vendors.length}`);
        console.log(`   - Assets: ${assets.length}`);
        console.log("\n🔐 Default Admin Credentials:");
        console.log("   Email: admin@company.com");
        console.log("   Password: admin123");
        console.log("\n🔐 Default Staff Credentials:");
        console.log("   Email: staff@company.com");
        console.log("   Password: admin123");
        console.log("========================================\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seed();
