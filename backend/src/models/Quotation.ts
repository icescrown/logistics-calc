import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Carrier from './Carrier';
import LogisticsMethod from './LogisticsMethod';
import Region from './Region';
import QuotationWeightRange from './QuotationWeightRange';

class Quotation extends Model {
  public id!: number;
  public carrier_id!: number;
  public logistics_method_id!: number;
  public region_id!: number;
  public discount!: number;
  public effective_date!: Date;
  public expire_date!: Date;
  public status!: number;
  public readonly create_time!: Date;
  public readonly update_time!: Date;
}

Quotation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    carrier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    logistics_method_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    region_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 1.00,
      allowNull: false,
    },
    effective_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expire_date: {
      type: DataTypes.DATE,
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
    tableName: 'quotation',
    timestamps: false,
  }
);
// 定义关联关系
Quotation.belongsTo(Carrier, { foreignKey: 'carrier_id', as: 'carrier' });
Quotation.belongsTo(LogisticsMethod, { foreignKey: 'logistics_method_id', as: 'logistics_method' });
Quotation.belongsTo(Region, { foreignKey: 'region_id', as: 'region' });
Quotation.hasMany(QuotationWeightRange, { foreignKey: 'quotation_id', as: 'quotation_weight_ranges' });

export default Quotation;