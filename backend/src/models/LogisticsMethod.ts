import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Carrier from './Carrier';

class LogisticsMethod extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public carrier_id!: number;
  public type!: string;
  public description!: string;
  public status!: number;
  public readonly create_time!: Date;
  public readonly update_time!: Date;
  
  // 关联
  public Carrier?: Carrier;
}

LogisticsMethod.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    carrier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'logistics_method',
    timestamps: false,
  }
);

// 定义关联关系
LogisticsMethod.belongsTo(Carrier, {
  foreignKey: 'carrier_id',
  as: 'Carrier',
});

export default LogisticsMethod;