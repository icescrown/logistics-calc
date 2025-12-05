"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
const Warehouse_1 = __importDefault(require("../models/Warehouse"));
const Carrier_1 = __importDefault(require("../models/Carrier"));
const Region_1 = __importDefault(require("../models/Region"));
const initDB = async () => {
    try {
        // 测试数据库连接
        await db_1.default.authenticate();
        console.log('数据库连接成功');
        // 自动创建表结构
        await db_1.default.sync({ force: false });
        console.log('表结构创建成功');
        // 初始化基础数据
        await initBaseData();
        console.log('基础数据初始化成功');
    }
    catch (error) {
        console.error('数据库初始化失败:', error);
        process.exit(1);
    }
};
const initBaseData = async () => {
    // 初始化仓库数据
    const warehouseCount = await Warehouse_1.default.count();
    if (warehouseCount === 0) {
        await Warehouse_1.default.bulkCreate([
            {
                name: '英国仓',
                code: 'UK001',
                address: '英国伦敦',
                contact: '张三',
                phone: '1234567890',
                status: 1,
            },
        ]);
    }
    // 初始化承运商数据
    const carrierCount = await Carrier_1.default.count();
    if (carrierCount === 0) {
        await Carrier_1.default.bulkCreate([
            {
                name: '邮局',
                code: 'POST',
                contact: '李四',
                phone: '0987654321',
                email: 'post@example.com',
                status: 1,
            },
            {
                name: 'EVRI',
                code: 'EVRI',
                contact: '王五',
                phone: '1122334455',
                email: 'evri@example.com',
                status: 1,
            },
            {
                name: 'Yodel',
                code: 'YODEL',
                contact: '赵六',
                phone: '2233445566',
                email: 'yodel@example.com',
                status: 1,
            },
        ]);
    }
    // 初始化区域数据
    const regionCount = await Region_1.default.count();
    if (regionCount === 0) {
        await Region_1.default.bulkCreate([
            {
                name: '英国',
                code: 'UK',
                type: '国家',
                status: 1,
            },
            {
                name: '伦敦',
                code: 'LDN',
                type: '城市',
                status: 1,
            },
            {
                name: '曼彻斯特',
                code: 'MAN',
                type: '城市',
                status: 1,
            },
        ]);
    }
};
exports.default = initDB;
//# sourceMappingURL=initDB.js.map