"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../utils/db"));
const Warehouse_1 = __importDefault(require("../models/Warehouse"));
const Carrier_1 = __importDefault(require("../models/Carrier"));
const LogisticsMethod_1 = __importDefault(require("../models/LogisticsMethod"));
const Region_1 = __importDefault(require("../models/Region"));
const Country_1 = __importDefault(require("../models/Country"));
// 导入关联配置
require("../models/associations");
const initDB = async () => {
    try {
        // 测试数据库连接
        await db_1.default.authenticate();
        console.log('数据库连接成功');
        // 自动创建表结构，仅修改表结构而不删除数据
        await db_1.default.sync({ alter: true });
        console.log('表结构创建/更新成功');
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
    // 初始化国家数据
    const countryCount = await Country_1.default.count();
    if (countryCount === 0) {
        await Country_1.default.bulkCreate([
            {
                name: '英国',
                code: 'UK',
                iso_code: 'GB',
                official_name_en: 'United Kingdom of Great Britain and Northern Ireland',
                continent: 'Europe',
                status: 1,
            },
            {
                name: '美国',
                code: 'US',
                iso_code: 'US',
                official_name_en: 'United States of America',
                continent: 'North America',
                status: 1,
            },
            {
                name: '德国',
                code: 'DE',
                iso_code: 'DE',
                official_name_en: 'Federal Republic of Germany',
                continent: 'Europe',
                status: 1,
            },
        ]);
        console.log('国家数据初始化成功');
    }
    else {
        console.log(`国家表已有 ${countryCount} 条数据，跳过初始化`);
    }
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
                type: 'country',
                status: 1,
            },
            {
                name: '伦敦',
                code: 'LDN',
                type: 'postal_code',
                status: 1,
            },
            {
                name: '曼彻斯特',
                code: 'MAN',
                type: 'postal_code',
                status: 1,
            },
        ]);
    }
    // 初始化物流方式数据
    const logisticsMethodCount = await LogisticsMethod_1.default.count();
    if (logisticsMethodCount === 0) {
        // 获取已创建的承运商
        const carriers = await Carrier_1.default.findAll();
        const logisticsMethods = [];
        // 为每个承运商创建一些物流方式
        carriers.forEach((carrier) => {
            logisticsMethods.push({
                name: `${carrier.name}标准快递`,
                code: `${carrier.code}_STANDARD`,
                carrier_id: carrier.id,
                type: '快递',
                description: `${carrier.name}标准快递服务`,
                status: 1,
            }, {
                name: `${carrier.name}加急快递`,
                code: `${carrier.code}_EXPRESS`,
                carrier_id: carrier.id,
                type: '快递',
                description: `${carrier.name}加急快递服务`,
                status: 1,
            });
        });
        await LogisticsMethod_1.default.bulkCreate(logisticsMethods);
    }
};
// 如果直接运行此脚本，则执行初始化
if (require.main === module) {
    initDB();
}
exports.default = initDB;
//# sourceMappingURL=init-db.js.map