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

async function testPostalCodeGB() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // 测试场景：英国(GB)，邮编DBAA
    await testGBPostalCode('GB', 'DBAA');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

// 测试英国邮编匹配
async function testGBPostalCode(countryCode, postalCode) {
  console.log(`\n\n=== 测试英国邮编匹配：国家=${countryCode}，邮编=${postalCode} ===`);
  
  // 获取英国的国家ID
  const countryRecord = await Country.findOne({
    where: {
      [Op.or]: [
        { code: countryCode },
        { iso_code: countryCode }
      ],
      status: 1
    }
  });
  
  const countryId = countryRecord?.id;
  console.log(`国家 ${countryCode} 的ID: ${countryId}`);
  
  // 获取所有有效的英国邮编记录
  const allPostalCodes = await PostalCode.findAll({
    where: {
      status: 1,
      country_id: countryId
    },
    include: [
      {
        model: Region,
        as: 'regions',
        where: { status: 1 }
      }
    ]
  });
  
  console.log(`\n英国所有有效的邮编模式:`);
  allPostalCodes.forEach(postalCode => {
    console.log(`邮编模式: ${postalCode.code}`);
    postalCode.regions.forEach(region => {
      console.log(`  - 关联区域: ${region.name} (${region.code})`);
    });
  });
  
  // 测试当前的匹配逻辑
  console.log(`\n\n=== 测试当前匹配逻辑 ===`);
  
  // 1. 精确匹配
  let exactMatches = allPostalCodes.filter(pc => pc.code === postalCode);
  console.log(`1. 精确匹配结果: ${exactMatches.length} 条记录`);
  
  // 2. 通配符匹配（使用 Op.like）
  let wildcardMatches = allPostalCodes.filter(pc => pc.code.includes(postalCode));
  console.log(`2. 通配符匹配结果（包含 "${postalCode}"）: ${wildcardMatches.length} 条记录`);
  
  // 3. 特殊模式匹配（当前代码使用的逻辑）
  let specialMatches = allPostalCodes.filter(record => {
    const pattern = record.code;
    
    console.log(`\n   测试模式: ${pattern}`);
    
    // 精确匹配
    if (pattern === postalCode) {
      console.log(`   - 精确匹配: 是`);
      return true;
    }
    
    // 通配符匹配 (*)
    if (pattern.includes('*')) {
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
      const matchResult = regex.test(postalCode);
      console.log(`   - 通配符匹配: ${matchResult} (正则: ${regex})`);
      return matchResult;
    }
    
    // 范围匹配 (如 12300-12400)
    if (pattern.includes('-')) {
      const [min, max] = pattern.split('-').map(p => p.trim());
      if (min && max && postalCode >= min && postalCode <= max) {
        console.log(`   - 范围匹配: 是`);
        return true;
      }
    }
    
    console.log(`   - 不匹配`);
    return false;
  });
  
  console.log(`\n3. 特殊模式匹配结果: ${specialMatches.length} 条记录`);
  specialMatches.forEach(match => {
    console.log(`\n   匹配到的邮编模式: ${match.code}`);
    match.regions.forEach(region => {
      console.log(`   - 关联区域: ${region.name} (${region.code})`);
    });
  });
  
  // 分析问题
  console.log(`\n\n=== 问题分析 ===`);
  console.log(`当前匹配逻辑存在的问题:`);
  console.log(`1. 通配符匹配使用的是 Op.like '%${postalCode}%'，这会匹配包含该邮编的所有记录`);
  console.log(`2. 特殊模式匹配中，正则表达式 ^${pattern.replace(/\*/g, '.*')}$ 可能存在问题`);
  console.log(`3. 例如，模式 A* 会匹配以 A 开头的所有字符串，而 DBAA 不是以 A 开头的`);
  console.log(`4. 但如果代码中存在其他匹配逻辑，可能会导致不匹配的结果`);
}

testPostalCodeGB();
