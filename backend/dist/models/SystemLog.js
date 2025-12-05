"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
class SystemLog extends sequelize_1.Model {
}
SystemLog.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    operation: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    module: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    ip: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    create_time: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    tableName: 'system_log',
    timestamps: false,
});
exports.default = SystemLog;
//# sourceMappingURL=SystemLog.js.map