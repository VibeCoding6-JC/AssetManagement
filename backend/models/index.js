import Users from "./UserModel.js";
import Categories from "./CategoryModel.js";
import Locations from "./LocationModel.js";
import Vendors from "./VendorModel.js";
import Assets from "./AssetModel.js";
import Transactions from "./TransactionModel.js";

// ============================================
// ASSET RELATIONSHIPS
// ============================================

// Asset belongs to Category (Many-to-One)
Categories.hasMany(Assets, { 
    foreignKey: "category_id",
    as: "assets"
});
Assets.belongsTo(Categories, { 
    foreignKey: "category_id",
    as: "category"
});

// Asset belongs to Location (Many-to-One)
Locations.hasMany(Assets, { 
    foreignKey: "location_id",
    as: "assets"
});
Assets.belongsTo(Locations, { 
    foreignKey: "location_id",
    as: "location"
});

// Asset belongs to Vendor (Many-to-One, Optional)
Vendors.hasMany(Assets, { 
    foreignKey: "vendor_id",
    as: "assets"
});
Assets.belongsTo(Vendors, { 
    foreignKey: "vendor_id",
    as: "vendor"
});

// Asset belongs to User as Current Holder (Many-to-One, Optional)
Users.hasMany(Assets, { 
    foreignKey: "current_holder_id",
    as: "heldAssets"
});
Assets.belongsTo(Users, { 
    foreignKey: "current_holder_id",
    as: "holder"
});

// ============================================
// TRANSACTION RELATIONSHIPS
// ============================================

// Transaction belongs to Asset
Assets.hasMany(Transactions, { 
    foreignKey: "asset_id",
    as: "transactions"
});
Transactions.belongsTo(Assets, { 
    foreignKey: "asset_id",
    as: "asset"
});

// Transaction involves User (Employee/Borrower)
Users.hasMany(Transactions, { 
    foreignKey: "user_id",
    as: "employeeTransactions"
});
Transactions.belongsTo(Users, { 
    foreignKey: "user_id",
    as: "employee"
});

// Transaction processed by Admin
Users.hasMany(Transactions, { 
    foreignKey: "admin_id",
    as: "adminTransactions"
});
Transactions.belongsTo(Users, { 
    foreignKey: "admin_id",
    as: "admin"
});

export { 
    Users, 
    Categories, 
    Locations, 
    Vendors, 
    Assets, 
    Transactions 
};
