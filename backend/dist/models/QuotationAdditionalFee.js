"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
class QuotationAdditionalFee extends sequelize_1.Model {
}
QuotationAdditionalFee.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    quotation_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    additional_fee_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    calculation_rule: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
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
    tableName: 'quotation_additional_fee',
    timestamps: false,
});
exports.default = QuotationAdditionalFee;
//# sourceMappingURL=QuotationAdditionalFee.js.map