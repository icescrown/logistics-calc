"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
const Quotation_1 = __importDefault(require("./Quotation"));
class QuotationWeightRange extends sequelize_1.Model {
}
QuotationWeightRange.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    quotation_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Quotation_1.default,
            key: 'id'
        }
    },
    weight_from: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    weight_to: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    base_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    additional_weight: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
    },
    additional_weight_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
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
    tableName: 'quotation_weight_range',
    timestamps: false,
});
exports.default = QuotationWeightRange;
//# sourceMappingURL=QuotationWeightRange.js.map