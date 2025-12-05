import sequelize from './db';
import Warehouse from '../models/Warehouse';
import Carrier from '../models/Carrier';
import LogisticsMethod from '../models/LogisticsMethod';
import Region from '../models/Region';
import Quotation from '../models/Quotation';

const checkAllStatus = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 检查仓库状态
    const warehouses = await Warehouse.findAll({
      attributes: ['id', 'name', 'code', 'status'],
    });
    console.log('\n仓库状态：');
    warehouses.forEach(item => {
      console.log(`- ID: ${item.id}, 名称: ${item.name}, 状态: ${item.status}`);
    });

    // 检查承运商状态
    const carriers = await Carrier.findAll({
      attributes: ['id', 'name', 'code', 'status'],
    });
    console.log('\n承运商状态：');
    carriers.forEach(item => {
      console.log(`- ID: ${item.id}, 名称: ${item.name}, 状态: ${item.status}`);
    });

    // 检查物流方式状态
    const logisticsMethods = await LogisticsMethod.findAll({
      attributes: ['id', 'name', 'code', 'status'],
    });
    console.log('\n物流方式状态：');
    logisticsMethods.forEach(item => {
      console.log(`- ID: ${item.id}, 名称: ${item.name}, 状态: ${item.status}`);
    });

    // 检查区域状态
    const regions = await Region.findAll({
      attributes: ['id', 'name', 'code', 'status'],
    });
    console.log('\n区域状态：');
    regions.forEach(item => {
      console.log(`- ID: ${item.id}, 名称: ${item.name}, 状态: ${item.status}`);
      
      // 如果状态为0，更新为1
      if (item.status === 0) {
        item.update({ status: 1 });
        console.log(`  ✓ 已更新状态为1`);
      }
    });

    // 检查报价状态
    const quotations = await Quotation.findAll({
      attributes: ['id', 'carrier_id', 'logistics_method_id', 'status'],
      limit: 5, // 只检查前5条
    });
    console.log('\n报价状态（前5条）：');
    quotations.forEach(item => {
      console.log(`- ID: ${item.id}, 状态: ${item.status}`);
    });

    // 更新所有状态为0的数据为1
    await Warehouse.update({ status: 1 }, { where: { status: 0 } });
    await Carrier.update({ status: 1 }, { where: { status: 0 } });
    await LogisticsMethod.update({ status: 1 }, { where: { status: 0 } });
    await Region.update({ status: 1 }, { where: { status: 0 } });
    await Quotation.update({ status: 1 }, { where: { status: 0 } });

    console.log('\n已将所有状态为0的数据更新为1');

    process.exit(0);
  } catch (error) {
    console.error('检查状态失败:', error);
    process.exit(1);
  }
};

checkAllStatus();