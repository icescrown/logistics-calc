import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Region from './Region';
import RegionPostalCode from './RegionPostalCode';

class PostalCode extends Model {
  public id!: number;
  public code!: string;
  public country_id!: number;
  public status!: number;
  public readonly create_time!: Date;
  public readonly update_time!: Date;
  
  // 关联
  public regions?: Region[];
}

PostalCode.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // 移除外键约束，数据库不允许创建外键
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
    },
    create_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    update_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'postal_code',
    timestamps: false,
  }
);

// 关联关系在 associations.ts 中定义，避免循环依赖

export default PostalCode;