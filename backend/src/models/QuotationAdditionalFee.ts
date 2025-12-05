import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Quotation from './Quotation';
import AdditionalFee from './AdditionalFee';

class QuotationAdditionalFee extends Model {
  public id!: number;
  public quotation_id!: number;
  public additional_fee_id!: number;
  public amount!: number;
  public calculation_rule!: string;
  public readonly create_time!: Date;
  public readonly update_time!: Date;
}

QuotationAdditionalFee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quotation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    additional_fee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    calculation_rule: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'quotation_additional_fee',
    timestamps: false,
  }
);

export default QuotationAdditionalFee;