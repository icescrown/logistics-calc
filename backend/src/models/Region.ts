import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Country from './Country';
import PostalCode from './PostalCode';
import RegionCountry from './RegionCountry';
import RegionPostalCode from './RegionPostalCode';

class Region extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public type!: string;
  public status!: number;
  public readonly create_time!: Date;
  public readonly update_time!: Date;
  
  // 关联
  public countries?: Country[];
  public postalCodes?: PostalCode[];
}

Region.init(
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
    tableName: 'region',
    timestamps: false,
  }
);

// 定义多对多关联关系
Region.belongsToMany(Country, {
  through: RegionCountry,
  foreignKey: 'region_id',
  otherKey: 'country_id',
  as: 'countries',
});

Region.belongsToMany(PostalCode, {
  through: RegionPostalCode,
  foreignKey: 'region_id',
  otherKey: 'postal_code_id',
  as: 'postalCodes',
});

export default Region;