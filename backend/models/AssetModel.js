import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Assets = db.define("assets", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 150]
        }
    },
    asset_tag: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    serial_number: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "categories",
            key: "id"
        }
    },
    location_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "locations",
            key: "id"
        }
    },
    vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "vendors",
            key: "id"
        }
    },
    current_holder_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "users",
            key: "id"
        }
    },
    status: {
        type: DataTypes.ENUM("available", "assigned", "repair", "retired", "missing"),
        defaultValue: "available",
        allowNull: false
    },
    condition: {
        type: DataTypes.ENUM("new", "good", "fair", "poor"),
        defaultValue: "new",
        allowNull: false
    },
    purchase_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    purchase_price: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        allowNull: false
    },
    warranty_expiry: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    specifications: {
        type: DataTypes.JSON,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ["asset_tag"]
        },
        {
            fields: ["serial_number"]
        },
        {
            fields: ["status"]
        },
        {
            fields: ["category_id"]
        },
        {
            fields: ["location_id"]
        }
    ]
});

export default Assets;
