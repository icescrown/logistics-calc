"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
const Carrier_1 = __importDefault(require("../models/Carrier"));
const checkCarrierStatus = async () => {
    try {
        // 测试数据库连接
        await db_1.default.authenticate();
        console.log('数据库连接成功');
        // 查询所有承运商，包括状态为0的
        const allCarriers = await Carrier_1.default.findAll({
            attributes: ['id', 'name', 'code', 'status', 'create_time'],
            order: [['create_time', 'DESC']],
        });
        console.log('所有承运商数据：');
        allCarriers.forEach(carrier => {
            console.log(`- ID: ${carrier.id}, 名称: ${carrier.name}, 编码: ${carrier.code}, 状态: ${carrier.status}, 创建时间: ${carrier.create_time}`);
        });
        // 查询状态为1的承运商
        const activeCarriers = await Carrier_1.default.findAll({
            where: { status: 1 },
            attributes: ['id', 'name', 'code', 'status', 'create_time'],
            order: [['create_time', 'DESC']],
        });
        console.log('\n状态为1的承运商数据：');
        activeCarriers.forEach(carrier => {
            console.log(`- ID: ${carrier.id}, 名称: ${carrier.name}, 编码: ${carrier.code}, 状态: ${carrier.status}, 创建时间: ${carrier.create_time}`);
        });
        process.exit(0);
    }
    catch (error) {
        console.error('检查承运商状态失败:', error);
        process.exit(1);
    }
};
checkCarrierStatus();
//# sourceMappingURL=checkCarrierStatus.js.map