"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
const Country_1 = __importDefault(require("./Country"));
const PostalCode_1 = __importDefault(require("./PostalCode"));
const RegionCountry_1 = __importDefault(require("./RegionCountry"));
const RegionPostalCode_1 = __importDefault(require("./RegionPostalCode"));
class Region extends sequelize_1.Model {
}
Region.init({
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
    type: {
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
    tableName: 'region',
    timestamps: false,
});
// 定义多对多关联关系
Region.belongsToMany(Country_1.default, {
    through: RegionCountry_1.default,
    foreignKey: 'region_id',
    otherKey: 'country_id',
    as: 'countries',
});
Region.belongsToMany(PostalCode_1.default, {
    through: RegionPostalCode_1.default,
    foreignKey: 'region_id',
    otherKey: 'postal_code_id',
    as: 'postalCodes',
});
exports.default = Region;
//# sourceMappingURL=Region.js.map