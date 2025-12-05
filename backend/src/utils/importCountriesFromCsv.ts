import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import sequelize from './db';
import Country from '../models/Country';

// CSV文件路径
const csvFilePath = path.join(__dirname, '../../../country-codes.csv');

// 导入国家数据
const importCountries = async () => {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 保留现有数据，只添加新数据
    console.log('保留现有数据，开始导入新数据...');

    // 读取CSV文件
    const countries: any[] = [];
    
    console.log('开始读取CSV文件:', csvFilePath);
    
    // 使用GBK编码读取文件
    const iconv = require('iconv-lite');
    
    // 同步读取文件内容
    const fileContent = fs.readFileSync(csvFilePath);
    const decodedContent = iconv.decode(fileContent, 'gbk');
    
    // 解析CSV内容
    const csv = require('csv-parser');
    const { Readable } = require('stream');
    
    await new Promise<void>((resolve, reject) => {
      Readable.from(decodedContent)
        .pipe(csv({
          // 确保正确解析CSV
          separator: ',',
          quote: '"',
          escape: '"',
          // 跳过空行
          skipLines: 0
        }))
        .on('data', (row: Record<string, string>) => {
          // 打印第一行数据，查看字段名
          if (countries.length === 0) {
            console.log('CSV文件第一行数据:', JSON.stringify(row, null, 2));
          }
          
          // 提取需要的字段
          const countryData = {
            name: row['official_name_cn'] || row['official_name_en'] || '',
            code: row['ISO3166-1-Alpha-3'] || '',
            iso_code: row['ISO3166-1-Alpha-2'] || '',
            official_name_en: row['official_name_en'] || '',
            continent: row['Continent'] || '',
            status: 1,
          };
          
          // 打印提取的数据，查看是否正确
          if (countries.length < 5) {
            console.log('提取的国家数据:', countryData);
          }
          
          // 只添加有效的国家数据
          if (countryData.name && countryData.code && countryData.iso_code) {
            countries.push(countryData);
          }
        })
        .on('end', () => {
          console.log(`读取到 ${countries.length} 条国家数据`);
          resolve();
        })
        .on('error', (error: Error) => {
          console.error('读取CSV文件时出错:', error);
          reject(error);
        });
    });
    
    // 批量插入数据，每次插入50条
    if (countries.length > 0) {
      try {
        console.log('开始批量插入数据...');
        let insertedCount = 0;
        const batchSize = 50;
        
        for (let i = 0; i < countries.length; i += batchSize) {
          const batch = countries.slice(i, i + batchSize);
          const inserted = await Country.bulkCreate(batch, { 
            validate: true,
            ignoreDuplicates: true
          });
          insertedCount += inserted.length;
          console.log(`已插入 ${insertedCount} / ${countries.length} 条记录`);
        }
        
        console.log(`国家数据导入成功，共插入 ${insertedCount} 条记录`);
        
        // 验证插入结果
        const count = await Country.count();
        console.log(`插入后国家表中共有 ${count} 条数据`);
      } catch (error) {
        console.error('批量插入数据失败:', error);
      }
    } else {
      console.log('没有有效数据需要导入');
    }
    
    // 关闭数据库连接
    await sequelize.close();
  } catch (error) {
    console.error('导入国家数据时出错:', error);
    sequelize.close();
  }
};

// 执行导入
importCountries();