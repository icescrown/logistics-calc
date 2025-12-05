const { Sequelize, Op } = require('sequelize');
require('dotenv').config();

// 直接导入模型
const Country = require('./dist/models/Country');

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: parseInt(process.env.DB_PORT, 10),
    logging: false
  }
);

async function checkCountry() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // 查找所有国家
    const allCountries = await Country.findAll({
      where: { status: 1 }
    });
    
    console.log('\n所有国家记录:');
    allCountries.forEach(country => {
      console.log(`ID: ${country.id}, 名称: ${country.name}, 代码: ${country.code}, ISO代码: ${country.iso_code}`);
    });
    
    // 测试查找不丹
    console.log('\n\n=== 测试查找不丹 ===');
    
    // 用中文名称查找
    const chinaName = await Country.findOne({
      where: {
        name: '不丹',
        status: 1
      }
    });
    console.log(`用中文名称"不丹"查找: ${chinaName ? '找到' : '未找到'}`);
    if (chinaName) {
      console.log(`  ID: ${chinaName.id}, 名称: ${chinaName.name}, 代码: ${chinaName.code}, ISO代码: ${chinaName.iso_code}`);
    }
    
    // 用代码"BT"查找
    const code = await Country.findOne({
      where: {
        code: 'BT',
        status: 1
      }
    });
    console.log(`\n用代码"BT"查找: ${code ? '找到' : '未找到'}`);
    if (code) {
      console.log(`  ID: ${code.id}, 名称: ${code.name}, 代码: ${code.code}, ISO代码: ${code.iso_code}`);
    }
    
    // 用ISO代码"BT"查找
    const isoCode = await Country.findOne({
      where: {
        iso_code: 'BT',
        status: 1
      }
    });
    console.log(`\n用ISO代码"BT"查找: ${isoCode ? '找到' : '未找到'}`);
    if (isoCode) {
      console.log(`  ID: ${isoCode.id}, 名称: ${isoCode.name}, 代码: ${isoCode.code}, ISO代码: ${isoCode.iso_code}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkCountry();
