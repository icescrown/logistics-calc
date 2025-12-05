import sequelize from '../utils/db';

async function addWarehouseIdColumn() {
  try {
    // 连接到数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 使用 raw SQL 添加 warehouse_id 列
    await sequelize.query(`
      ALTER TABLE quotation 
      ADD COLUMN warehouse_id INT NOT NULL DEFAULT 1
    `);
    
    console.log('成功添加 warehouse_id 列到 quotation 表');
    
    // 关闭数据库连接
    await sequelize.close();
  } catch (error) {
    console.error('添加列失败:', error);
    process.exit(1);
  }
}

addWarehouseIdColumn();