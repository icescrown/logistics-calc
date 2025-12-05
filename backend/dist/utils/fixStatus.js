"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
const Warehouse_1 = __importDefault(require("../models/Warehouse"));
const Carrier_1 = __importDefault(require("../models/Carrier"));
const LogisticsMethod_1 = __importDefault(require("../models/LogisticsMethod"));
const Region_1 = __importDefault(require("../models/Region"));
const Quotation_1 = __importDefault(require("../models/Quotation"));
const fixStatus = async () => {
    try {
        // 测试数据库连接
        await db_1.default.authenticate();
        console.log('数据库连接成功');
        // 逐个更新每个表的状态
        console.log('\n开始更新所有表的状态...');
        // 更新仓库状态
        try {
            const warehouseResult = await Warehouse_1.default.update({ status: 1 }, { where: { status: 0 } });
            console.log(`仓库表：更新了 ${warehouseResult[0]} 条记录`);
        }
        catch (error) {
            console.error('仓库表更新失败:', error);
        }
        // 更新承运商状态
        try {
            const carrierResult = await Carrier_1.default.update({ status: 1 }, { where: { status: 0 } });
            console.log(`承运商表：更新了 ${carrierResult[0]} 条记录`);
        }
        catch (error) {
            console.error('承运商表更新失败:', error);
        }
        // 更新物流方式状态
        try {
            const logisticsMethodResult = await LogisticsMethod_1.default.update({ status: 1 }, { where: { status: 0 } });
            console.log(`物流方式表：更新了 ${logisticsMethodResult[0]} 条记录`);
        }
        catch (error) {
            console.error('物流方式表更新失败:', error);
        }
        // 更新区域状态
        try {
            const regionResult = await Region_1.default.update({ status: 1 }, { where: { status: 0 } });
            console.log(`区域表：更新了 ${regionResult[0]} 条记录`);
        }
        catch (error) {
            console.error('区域表更新失败:', error);
        }
        // 更新报价状态
        try {
            const quotationResult = await Quotation_1.default.update({ status: 1 }, { where: { status: 0 } });
            console.log(`报价表：更新了 ${quotationResult[0]} 条记录`);
        }
        catch (error) {
            console.error('报价表更新失败:', error);
        }
        // 验证更新结果
        console.log('\n验证更新结果：');
        // 验证承运商状态
        const carriers = await Carrier_1.default.findAll({
            attributes: ['id', 'name', 'code', 'status'],
        });
        console.log('\n承运商状态：');
        carriers.forEach(carrier => {
            console.log(`- ID: ${carrier.id}, 名称: ${carrier.name}, 状态: ${carrier.status}`);
        });
        // 验证仓库状态
        const warehouses = await Warehouse_1.default.findAll({
            attributes: ['id', 'name', 'code', 'status'],
        });
        console.log('\n仓库状态：');
        warehouses.forEach(warehouse => {
            console.log(`- ID: ${warehouse.id}, 名称: ${warehouse.name}, 状态: ${warehouse.status}`);
        });
        process.exit(0);
    }
    catch (error) {
        console.error('修复状态失败:', error);
        process.exit(1);
    }
};
fixStatus();
//# sourceMappingURL=fixStatus.js.map