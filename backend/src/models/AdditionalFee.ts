import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class AdditionalFee extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public type!: string;
  public calculation_method!: string;
  public status!: number;
  public readonly create_time!: Date;
  public readonly update_time!: Date;
}

AdditionalFee.init(
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
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    calculation_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    tableName: 'additional_fee',
    timestamps: false,
  }
);

export default AdditionalFee;