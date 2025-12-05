import sequelize from './db';
import Country from '../models/Country';

// 验证国家数据导入
const verifyCountryImport = async () => {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 查询国家数据数量
    const count = await Country.count();
    console.log(`国家表中共有 ${count} 条数据`);

    // 查询前10条数据，验证字段是否正确
    const countries = await Country.findAll({
      limit: 10,
      attributes: ['id', 'name', 'code', 'iso_code', 'official_name_en', 'status'],
      order: [['id', 'ASC']]
    });

    console.log('前10条国家数据：');
    countries.forEach(country => {
      console.log(`ID: ${country.id}, Name: ${country.name}, Code: ${country.code}, ISO Code: ${country.iso_code}, English Name: ${country.official_name_en}, Status: ${country.status}`);
    });

    // 关闭数据库连接
    await sequelize.close();
  } catch (error) {
    console.error('验证国家数据时出错:', error);
    sequelize.close();
  }
};

// 执行验证
verifyCountryImport();