import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class SystemLog extends Model {
  public id!: number;
  public user_id!: number;
  public operation!: string;
  public module!: string;
  public content!: string;
  public ip!: string;
  public readonly create_time!: Date;
}

SystemLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    operation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    create_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'system_log',
    timestamps: false,
  }
);

export default SystemLog;