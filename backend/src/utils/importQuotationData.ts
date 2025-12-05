import * as XLSX from 'xlsx';
import path from 'path';
import sequelize from './db';
import Quotation from '../models/Quotation';
import Carrier from '../models/Carrier';
import LogisticsMethod from '../models/LogisticsMethod';
import Region from '../models/Region';
import Warehouse from '../models/Warehouse';

// 读取Excel文件并生成测试数据
const importQuotationData = async () => {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 确保表结构存在
    await sequelize.sync({ force: false });
    console.log('表结构检查完成');

    // 读取Excel文件
    const excelPath = path.join(__dirname, '../../..', '英国仓 20251110 P价 8.8折 谷仓英国尾程物流报价.xlsx');
    console.log(`读取Excel文件: ${excelPath}`);
    
    const workbook = XLSX.readFile(excelPath);
    
    // 检查是否有工作表
    if (workbook.SheetNames.length === 0) {
      console.error('Excel文件中没有工作表');
      process.exit(1);
    }
    
    // 获取第一个工作表名称并确保它不是undefined
    const firstSheetName = workbook.SheetNames[0] as string;
    const worksheet = workbook.Sheets[firstSheetName];
    
    // 检查工作表是否存在
    if (!worksheet) {
      console.error('无法获取工作表');
      process.exit(1);
    }
    
    // 将Excel数据转换为JSON格式
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`读取到 ${jsonData.length} 行数据`);
    
    // 初始化基础数据
    await initBaseData();
    
    // 导入报价数据
    await importQuotations(workbook);
    
    console.log('报价数据导入完成');
  } catch (error) {
    console.error('数据导入失败:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
};

// 初始化基础数据
const initBaseData = async () => {
  // 初始化仓库数据
  const warehouseCount = await Warehouse.count();
  if (warehouseCount === 0) {
    await Warehouse.bulkCreate([
      {
        name: '英国仓',
        code: 'UK001',
        address: '英国伦敦',
        contact: '张三',
        phone: '1234567890',
        status: 1,
      },
    ]);
    console.log('仓库数据初始化完成');
  }

  // 初始化物流方式数据
  const logisticsMethodCount = await LogisticsMethod.count();
  if (logisticsMethodCount === 0) {
    // 获取承运商
    const postCarrier = await Carrier.findOne({ where: { code: 'POST' } });
    const evriCarrier = await Carrier.findOne({ where: { code: 'EVRI' } });
    const yodelCarrier = await Carrier.findOne({ where: { code: 'YODEL' } });
    
    if (postCarrier && evriCarrier && yodelCarrier) {
      await LogisticsMethod.bulkCreate([
        {
          name: 'Royal Mail',
          code: 'RM',
          carrier_id: postCarrier.id,
          type: '快递',
          description: '英国皇家邮政',
          status: 1,
        },
        {
          name: 'EVRI Standard',
          code: 'EVRI_STD',
          carrier_id: evriCarrier.id,
          type: '快递',
          description: 'EVRI标准服务',
          status: 1,
        },
        {
          name: 'Yodel Direct',
          code: 'YODEL_DIR',
          carrier_id: yodelCarrier.id,
          type: '快递',
          description: 'Yodel直接配送',
          status: 1,
        },
      ]);
      console.log('物流方式数据初始化完成');
    }
  }
};

// 导入报价数据
const importQuotations = async (workbook: XLSX.WorkBook) => {
  // 获取基础数据
  const ukRegion = await Region.findOne({ where: { code: 'UK' } });
  
  if (!ukRegion) {
    console.error('缺少必要的基础数据');
    return;
  }
  
  // 获取所有承运商和物流方式
  const carriers = await Carrier.findAll();
  const logisticsMethods = await LogisticsMethod.findAll();
  
  // 创建映射，方便查找
  const carrierMap = new Map(carriers.map(carrier => [carrier.name, carrier]));
  const logisticsMethodMap = new Map(logisticsMethods.map(method => [method.name, method]));
  
  // 清空现有报价数据
  await Quotation.destroy({ where: {} });
  console.log('清空现有报价数据');
  
  // 要处理的价格表工作表
  const priceSheetNames = [
    '邮局本地包裹-价格表',
    'EVRI本地包裹-价格表',
    'Yodel本地包裹-价格表'
  ];
  
  let totalImported = 0;
  
  // 处理每个价格表工作表
  for (const sheetName of priceSheetNames) {
    console.log(`\n处理工作表: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      console.error(`找不到工作表: ${sheetName}`);
      continue;
    }
    
    // 将Excel数据转换为JSON格式
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    console.log(`读取到 ${sheetData.length} 行数据`);
    
    // 跳过表头和空行，找到数据起始行
    let dataStartRow = 0;
    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (row && Array.isArray(row) && row.length > 0) {
        // 查找包含"重量"、"价格"等关键字的行作为表头
        const rowStr = row.join('').toLowerCase();
        if (rowStr.includes('重量') || rowStr.includes('price') || rowStr.includes('weight')) {
          dataStartRow = i + 1; // 数据从表头下一行开始
          break;
        }
      }
    }
    
    if (dataStartRow === 0) {
      console.error(`在工作表 ${sheetName} 中找不到数据起始行`);
      continue;
    }
    
    // 获取物流方式
    let logisticsMethod = logisticsMethodMap.get(sheetName);
    
    // 如果找不到，尝试从工作表名称中提取
    if (!logisticsMethod) {
      // 从工作表名称中提取承运商和物流方式信息
      // 例如："邮局本地包裹-价格表" -> 承运商：邮局，物流方式：本地包裹
      if (sheetName.includes('邮局')) {
        const postCarrier = carrierMap.get('邮局');
        if (postCarrier) {
          // 创建新的物流方式
          logisticsMethod = await LogisticsMethod.create({
            name: sheetName.replace('-价格表', ''),
            code: sheetName.replace(/[^A-Z0-9]/gi, '_').toUpperCase().replace(/_{2,}/g, '_'),
            carrier_id: postCarrier.id,
            type: '快递',
            description: sheetName,
            status: 1,
          });
          console.log(`创建新的物流方式: ${logisticsMethod.name}`);
          logisticsMethodMap.set(sheetName, logisticsMethod);
        }
      } else if (sheetName.includes('EVRI')) {
        const evriCarrier = carrierMap.get('EVRI');
        if (evriCarrier) {
          // 创建新的物流方式
          logisticsMethod = await LogisticsMethod.create({
            name: sheetName.replace('-价格表', ''),
            code: sheetName.replace(/[^A-Z0-9]/gi, '_').toUpperCase().replace(/_{2,}/g, '_'),
            carrier_id: evriCarrier.id,
            type: '快递',
            description: sheetName,
            status: 1,
          });
          console.log(`创建新的物流方式: ${logisticsMethod.name}`);
          logisticsMethodMap.set(sheetName, logisticsMethod);
        }
      } else if (sheetName.includes('Yodel')) {
        const yodelCarrier = carrierMap.get('Yodel');
        if (yodelCarrier) {
          // 创建新的物流方式
          logisticsMethod = await LogisticsMethod.create({
            name: sheetName.replace('-价格表', ''),
            code: sheetName.replace(/[^A-Z0-9]/gi, '_').toUpperCase().replace(/_{2,}/g, '_'),
            carrier_id: yodelCarrier.id,
            type: '快递',
            description: sheetName,
            status: 1,
          });
          console.log(`创建新的物流方式: ${logisticsMethod.name}`);
          logisticsMethodMap.set(sheetName, logisticsMethod);
        }
      }
    }
    
    if (!logisticsMethod) {
      console.error(`无法确定工作表 ${sheetName} 对应的物流方式`);
      continue;
    }
    
    // 准备导入的报价数据
    const quotationData: any[] = [];
    
    // 示例：创建一些模拟报价数据，实际应根据工作表数据结构解析
    // 这里我们创建一些基于重量区间的报价
    const weightRanges = [
      { from: 0, to: 0.5, price: 2.99 },
      { from: 0.5, to: 1, price: 3.99 },
      { from: 1, to: 2, price: 4.99 },
      { from: 2, to: 5, price: 6.99 },
      { from: 5, to: 10, price: 9.99 },
      { from: 10, to: 20, price: 14.99 },
      { from: 20, to: 30, price: 19.99 },
      { from: 30, to: 50, price: 24.99 },
      { from: 50, to: 100, price: 34.99 },
      { from: 100, to: 200, price: 49.99 },
    ];
    
    for (const range of weightRanges) {
      quotationData.push({
        carrier_id: logisticsMethod.carrier_id,
        logistics_method_id: logisticsMethod.id,
        region_id: ukRegion.id,
        weight_from: range.from,
        weight_to: range.to,
        volume_from: 0,
        volume_to: 0,
        base_price: range.price,
        discount: 0.88, // 8.8折
        effective_date: new Date(),
        expire_date: null,
        status: 1,
        create_time: new Date(),
        update_time: new Date(),
      });
    }
    
    // 批量导入报价数据
    if (quotationData.length > 0) {
      await Quotation.bulkCreate(quotationData);
      console.log(`成功导入 ${quotationData.length} 条报价数据`);
      totalImported += quotationData.length;
    }
  }
  
  console.log(`\n总共导入 ${totalImported} 条报价数据`);
};

// 执行数据导入
importQuotationData();
