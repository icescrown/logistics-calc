"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
class RegionCountry extends sequelize_1.Model {
}
RegionCountry.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    region_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    country_id: {
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
    tableName: 'region_country',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['region_id', 'country_id'],
        },
    ],
});
exports.default = RegionCountry;
//# sourceMappingURL=RegionCountry.js.map