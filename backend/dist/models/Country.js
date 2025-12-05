"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
class Country extends sequelize_1.Model {
}
Country.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    code: {
        type: sequelize_1.DataTypes.STRING(50),
        unique: true,
        allowNull: false,
    },
    iso_code: {
        type: sequelize_1.DataTypes.STRING(10),
        unique: true,
        allowNull: false,
    },
    official_name_en: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    continent: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: false,
    },
    create_time: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: false,
    },
    update_time: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    tableName: 'country',
    timestamps: false,
});
exports.default = Country;
//# sourceMappingURL=Country.js.map