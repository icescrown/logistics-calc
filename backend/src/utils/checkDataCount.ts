import sequelize from './db';
import Warehouse from '../models/Warehouse';
import Carrier from '../models/Carrier';
import LogisticsMethod from '../models/LogisticsMethod';
import Region from '../models/Region';
import Quotation from '../models/Quotation';

const checkDataCount = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 检查各表的数据量
    const warehouseCount = await Warehouse.count();
    const carrierCount = await Carrier.count();
    const logisticsMethodCount = await LogisticsMethod.count();
    const regionCount = await Region.count();
    const quotationCount = await Quotation.count();

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
      const newWarehouseCount = await Warehouse.count();
      const newCarrierCount = await Carrier.count();
      const newRegionCount = await Region.count();
      
      console.log('\n初始化后的数据量：');
      console.log(`- 仓库表：${newWarehouseCount} 条`);
      console.log(`- 承运商表：${newCarrierCount} 条`);
      console.log(`- 区域表：${newRegionCount} 条`);
    }

    process.exit(0);
  } catch (error) {
    console.error('检查数据失败:', error);
    process.exit(1);
  }
};

const initBaseData = async () => {
  // 初始化仓库数据
  await Warehouse.bulkCreate([
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
  await Carrier.bulkCreate([
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
  await Region.bulkCreate([
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