"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../../.env' });
const sequelize = new sequelize_1.Sequelize({
    database: process.env.db_name || 'logistics',
    username: process.env.db_user || 'root',
    password: process.env.db_password || 'root',
    host: process.env.db_host || 'localhost',
    port: parseInt(process.env.db_port || '3306'),
    dialect: 'mysql',
    logging: false,
});
exports.default = sequelize;
//# sourceMappingURL=db.js.map