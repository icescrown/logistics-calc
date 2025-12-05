const { Sequelize, Op } = require('sequelize');
require('dotenv').config();

// 直接导入模型
const PostalCode = require('./dist/models/PostalCode');
const Region = require('./dist/models/Region');
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

async function testPostalCodeMatch() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // 测试修复效果：不丹(BT)，邮编CAB
    await testFixEffect();
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

// 测试修复效果
async function testFixEffect() {
  // 测试场景：不丹(BT)，邮编CAB
  const testCountry = 'BT';
  const testPostalCode = 'CAB';
  
  console.log(`\n\n=== 测试修复效果：国家=${testCountry}，邮编=${testPostalCode} ===`);
  
  // 获取当前国家的ID
  const countryRecord = await Country.findOne({
    where: {
      [Op.or]: [
        { code: testCountry },
        { iso_code: testCountry }
      ],
      status: 1
    }
  });
  
  const countryId = countryRecord?.id;
  console.log(`国家 ${testCountry} 的ID: ${countryId}`);
  
  // 旧逻辑：不考虑国家限制，只匹配邮编
  console.log(`\n\n=== 旧逻辑测试（不考虑国家限制） ===`);
  
  // 获取所有有效的邮编记录，不考虑国家
  const allPostalCodes = await PostalCode.findAll({
    where: { status: 1 },
    include: [
      {
        model: Region,
        as: 'regions',
        where: { status: 1 }
      }
    ]
  });
  
  // 旧逻辑：匹配所有包含"CAB"的邮编
  let oldLogicMatches = allPostalCodes.filter(postalCode => {
    const pattern = postalCode.code;
    
    // 精确匹配
    if (pattern === testPostalCode) {
      return true;
    }
    
    // 通配符匹配 (*)
    if (pattern.includes('*')) {
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
      return regex.test(testPostalCode);
    }
    
    // 范围匹配 (如 12300-12400)
    if (pattern.includes('-')) {
      const [min, max] = pattern.split('-').map(p => p.trim());
      if (min && max && testPostalCode >= min && testPostalCode <= max) {
        return true;
      }
    }
    
    return false;
  });
  
  console.log(`旧逻辑匹配结果:`);
  console.log(`匹配到的邮编记录数量: ${oldLogicMatches.length}`);
  oldLogicMatches.forEach(match => {
    console.log(`\n邮编模式: ${match.code} (国家ID: ${match.country_id})`);
    match.regions.forEach(region => {
      console.log(`  - 匹配到的区域: ${region.name} (${region.code})`);
    });
  });
  
  // 新逻辑：考虑国家限制，只匹配指定国家的邮编
  console.log(`\n\n=== 新逻辑测试（考虑国家限制） ===`);
  
  // 获取所有有效的邮编记录，限定在当前国家
  const countryPostalCodes = await PostalCode.findAll({
    where: {
      status: 1,
      ...(countryId ? { country_id: countryId } : {})
    },
    include: [
      {
        model: Region,
        as: 'regions',
        where: { status: 1 }
      }
    ]
  });
  
  // 新逻辑：只匹配指定国家中包含"CAB"的邮编
  let newLogicMatches = countryPostalCodes.filter(postalCode => {
    const pattern = postalCode.code;
    
    // 精确匹配
    if (pattern === testPostalCode) {
      return true;
    }
    
    // 通配符匹配 (*)
    if (pattern.includes('*')) {
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
      return regex.test(testPostalCode);
    }
    
    // 范围匹配 (如 12300-12400)
    if (pattern.includes('-')) {
      const [min, max] = pattern.split('-').map(p => p.trim());
      if (min && max && testPostalCode >= min && testPostalCode <= max) {
        return true;
      }
    }
    
    return false;
  });
  
  console.log(`新逻辑匹配结果:`);
  console.log(`匹配到的邮编记录数量: ${newLogicMatches.length}`);
  newLogicMatches.forEach(match => {
    console.log(`\n邮编模式: ${match.code} (国家ID: ${match.country_id})`);
    match.regions.forEach(region => {
      console.log(`  - 匹配到的区域: ${region.name} (${region.code})`);
    });
  });
  
  // 检查修复效果
  if (newLogicMatches.length === 0 && oldLogicMatches.length > 0) {
    console.log(`\n\n✅ 修复成功！当前国家${testCountry}的邮编${testPostalCode}没有匹配到任何区域，避免了错误匹配。`);
    console.log(`   旧逻辑匹配到了${oldLogicMatches.length}个记录，而新逻辑只考虑当前国家，避免了跨国家的邮编混淆。`);
  } else if (newLogicMatches.length > 0) {
    console.log(`\n\n⚠️  修复后仍匹配到了区域，请验证这些区域是否确实属于国家${testCountry}。`);
  } else {
    console.log(`\n\nℹ️  无论是否考虑国家限制，都没有匹配到区域。`);
  }
};

testPostalCodeMatch();