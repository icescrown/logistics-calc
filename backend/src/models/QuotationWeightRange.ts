import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Quotation from './Quotation';

class QuotationWeightRange extends Model {
  public id!: number;
  public quotation_id!: number;
  public weight_from!: number;
  public weight_to!: number;
  public base_price!: number;
  public additional_weight!: number;
  public additional_weight_price!: number;
  public readonly create_time!: Date;
  public readonly update_time!: Date;
}

QuotationWeightRange.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quotation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Quotation,
        key: 'id'
      }
    },
    weight_from: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    weight_to: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    additional_weight: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
    additional_weight_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
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
    tableName: 'quotation_weight_range',
    timestamps: false,
  }
);

export default QuotationWeightRange;