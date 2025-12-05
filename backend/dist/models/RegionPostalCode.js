"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
class RegionPostalCode extends sequelize_1.Model {
}
RegionPostalCode.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    region_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    postal_code_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    create_time: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    tableName: 'region_postal_code',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['region_id', 'postal_code_id'],
        },
    ],
});
exports.default = RegionPostalCode;
//# sourceMappingURL=RegionPostalCode.js.map