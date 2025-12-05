import sequelize from './db';
import Carrier from '../models/Carrier';

const verifyUpdate = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 查询状态为1的承运商
    const activeCarriers = await Carrier.findAll({
      where: { status: 1 },
      attributes: ['id', 'name', 'code', 'status', 'create_time'],
      order: [['create_time', 'DESC']],
    });

    console.log('状态为1的承运商数据：');
    activeCarriers.forEach(carrier => {
      console.log(`- ID: ${carrier.id}, 名称: ${carrier.name}, 编码: ${carrier.code}, 状态: ${carrier.status}`);
    });

    // 直接查询所有承运商，不使用where条件
    const allCarriers = await Carrier.findAll({
      attributes: ['id', 'name', 'code', 'status', 'create_time'],
      order: [['create_time', 'DESC']],
    });

    console.log('\n所有承运商数据：');
    allCarriers.forEach(carrier => {
      console.log(`- ID: ${carrier.id}, 名称: ${carrier.name}, 编码: ${carrier.code}, 状态: ${carrier.status}`);
    });

    // 尝试直接更新一个承运商的状态
    await Carrier.update({ status: 1 }, { where: { id: 1 } });
    console.log('\n已直接更新ID为1的承运商状态为1');

    // 再次查询状态为1的承运商
    const updatedCarriers = await Carrier.findAll({
      where: { status: 1 },
      attributes: ['id', 'name', 'code', 'status', 'create_time'],
      order: [['create_time', 'DESC']],
    });

    console.log('\n更新后状态为1的承运商数据：');
    updatedCarriers.forEach(carrier => {
      console.log(`- ID: ${carrier.id}, 名称: ${carrier.name}, 编码: ${carrier.code}, 状态: ${carrier.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('验证更新失败:', error);
    process.exit(1);
  }
};

verifyUpdate();