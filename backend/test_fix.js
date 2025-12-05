const express = require('express');
const { Op } = require('sequelize');
const sequelize = require('./src/utils/db');
const PostalCode = require('./src/models/PostalCode');
const Region = require('./src/models/Region');
const Country = require('./src/models/Country');

// 测试函数
async function testFix() {
  try {
    // 测试场景：不丹(BT)，邮编CAB
    const testCountry = 'BT';
    const testPostalCode = 'CAB';
    
    console.log(`=== 测试场景：国家=${testCountry}，邮编=${testPostalCode} ===`);
    
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
    
    // 测试修复后的逻辑：只匹配指定国家的邮编
    let postalCodeRecords = await PostalCode.findAll({
      where: {
        code: { [Op.like]: `%${testPostalCode}%` },
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
    
    console.log(`\n修复后匹配结果（只匹配国家${testCountry}的邮编）:`);
    console.log(`匹配到的邮编记录数量: ${postalCodeRecords.length}`);
    postalCodeRecords.forEach(postalCode => {
      console.log(`\n邮编模式: ${postalCode.code} (国家ID: ${postalCode.country_id})`);
      if (postalCode.regions && postalCode.regions.length > 0) {
        postalCode.regions.forEach(region => {
          console.log(`  - 匹配到的区域: ${region.name} (${region.code})`);
        });
      } else {
        console.log(`  - 未关联任何区域`);
      }
    });
    
    // 对比测试：不考虑国家限制的旧逻辑
    console.log(`\n\n=== 对比测试：不考虑国家限制的旧逻辑 ===`);
    const oldLogicPostalCodes = await PostalCode.findAll({
      where: {
        code: { [Op.like]: `%${testPostalCode}%` },
        status: 1
      },
      include: [
        {
          model: Region,
          as: 'regions',
          where: { status: 1 }
        }
      ]
    });
    
    console.log(`旧逻辑匹配结果（不考虑国家限制）:`);
    console.log(`匹配到的邮编记录数量: ${oldLogicPostalCodes.length}`);
    oldLogicPostalCodes.forEach(postalCode => {
      console.log(`\n邮编模式: ${postalCode.code} (国家ID: ${postalCode.country_id})`);
      if (postalCode.regions && postalCode.regions.length > 0) {
        postalCode.regions.forEach(region => {
          console.log(`  - 匹配到的区域: ${region.name} (${region.code})`);
        });
      } else {
        console.log(`  - 未关联任何区域`);
      }
    });
    
    // 检查修复效果
    if (postalCodeRecords.length === 0 && oldLogicPostalCodes.length > 0) {
      console.log(`\n\n✅ 修复成功！当前国家${testCountry}的邮编${testPostalCode}没有匹配到任何区域，避免了错误匹配。`);
    } else if (postalCodeRecords.length > 0) {
      console.log(`\n\n⚠️  修复后匹配到了区域，请验证这些区域是否确实属于国家${testCountry}。`);
    } else {
      console.log(`\n\nℹ️  无论是否考虑国家限制，都没有匹配到区域。`);
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  } finally {
    await sequelize.close();
  }
}

// 执行测试
testFix();
