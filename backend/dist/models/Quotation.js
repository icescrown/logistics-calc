"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
const Carrier_1 = __importDefault(require("./Carrier"));
const LogisticsMethod_1 = __importDefault(require("./LogisticsMethod"));
const Region_1 = __importDefault(require("./Region"));
const QuotationWeightRange_1 = __importDefault(require("./QuotationWeightRange"));
class Quotation extends sequelize_1.Model {
}
Quotation.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    carrier_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    logistics_method_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    region_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    discount: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        defaultValue: 1.00,
        allowNull: false,
    },
    effective_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    expire_date: {
        type: sequelize_1.DataTypes.DATE,
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
    tableName: 'quotation',
    timestamps: false,
});
// 定义关联关系
Quotation.belongsTo(Carrier_1.default, { foreignKey: 'carrier_id', as: 'carrier' });
Quotation.belongsTo(LogisticsMethod_1.default, { foreignKey: 'logistics_method_id', as: 'logistics_method' });
Quotation.belongsTo(Region_1.default, { foreignKey: 'region_id', as: 'region' });
Quotation.hasMany(QuotationWeightRange_1.default, { foreignKey: 'quotation_id', as: 'quotation_weight_ranges' });
exports.default = Quotation;
//# sourceMappingURL=Quotation.js.map