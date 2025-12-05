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
const checkDataCount = async () => {
    try {
        // 测试数据库连接
        await db_1.default.authenticate();
        console.log('数据库连接成功');
        // 检查各表的数据量
        const warehouseCount = await Warehouse_1.default.count();
        const carrierCount = await Carrier_1.default.count();
        const logisticsMethodCount = await LogisticsMethod_1.default.count();
        const regionCount = await Region_1.default.count();
        const quotationCount = await Quotation_1.default.count();
        console.log('各表数据量：');
        console.log(`- 仓库表：${warehouseCount} 条`);
        console.log(`- 承运商表：${carrierCount} 条`);
        console.log(`- 物流方式表：${logisticsMethodCount} 条`);
        console.log(`- 区域表：${regionCount} 条`);
        console.log(`- 报价表：${quotationCount} 条`);
        // 如果没有数据，初始化数据
        if (warehouseCount === 0 || carrierCount === 0 || regionCount === 0) {
            console.log('\n开始初始化基础数据...');
            await initBaseData();
            console.log('基础数据初始化完成');
            // 再次检查数据量
            const newWarehouseCount = await Warehouse_1.default.count();
            const newCarrierCount = await Carrier_1.default.count();
            const newRegionCount = await Region_1.default.count();
            console.log('\n初始化后的数据量：');
            console.log(`- 仓库表：${newWarehouseCount} 条`);
            console.log(`- 承运商表：${newCarrierCount} 条`);
            console.log(`- 区域表：${newRegionCount} 条`);
        }
        process.exit(0);
    }
    catch (error) {
        console.error('检查数据失败:', error);
        process.exit(1);
    }
};
const initBaseData = async () => {
    // 初始化仓库数据
    await Warehouse_1.default.bulkCreate([
        {
            name: '英国仓',
            code: 'UK001',
            address: '英国伦敦',
            contact: '张三',
            phone: '1234567890',
            status: 1,
        },
        {
            name: '美国仓',
            code: 'US001',
            address: '美国纽约',
            contact: '李四',
            phone: '0987654321',
            status: 1,
        },
    ]);
    // 初始化承运商数据
    await Carrier_1.default.bulkCreate([
        {
            name: '邮局',
            code: 'POST',
            contact: '王五',
            phone: '1122334455',
            email: 'post@example.com',
            status: 1,
        },
        {
            name: 'EVRI',
            code: 'EVRI',
            contact: '赵六',
            phone: '2233445566',
            email: 'evri@example.com',
            status: 1,
        },
        {
            name: 'Yodel',
            code: 'YODEL',
            contact: '孙七',
            phone: '3344556677',
            email: 'yodel@example.com',
            status: 1,
        },
    ]);
    // 初始化区域数据
    await Region_1.default.bulkCreate([
        {
            name: '英国',
            code: 'UK',
            parent_id: null,
            type: '国家',
            status: 1,
        },
        {
            name: '伦敦',
            code: 'LDN',
            parent_id: 1,
            type: '城市',
            status: 1,
        },
        {
            name: '曼彻斯特',
            code: 'MAN',
            parent_id: 1,
            type: '城市',
            status: 1,
        },
        {
            name: '美国',
            code: 'US',
            parent_id: null,
            type: '国家',
            status: 1,
        },
        {
            name: '纽约',
            code: 'NYC',
            parent_id: 4,
            type: '城市',
            status: 1,
        },
    ]);
};
checkDataCount();
//# sourceMappingURL=checkDataCount.js.map