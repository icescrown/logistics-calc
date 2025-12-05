import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class RegionPostalCode extends Model {
  public id!: number;
  public region_id!: number;
  public postal_code_id!: number;
  public readonly create_time!: Date;
}

RegionPostalCode.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    region_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    postal_code_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    create_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'region_postal_code',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['region_id', 'postal_code_id'],
      },
    ],
  }
);

export default RegionPostalCode;