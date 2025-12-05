import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class RegionCountry extends Model {
  public id!: number;
  public region_id!: number;
  public country_id!: number;
  public readonly create_time!: Date;
}

RegionCountry.init(
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
    country_id: {
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
    tableName: 'region_country',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['region_id', 'country_id'],
      },
    ],
  }
);

export default RegionCountry;