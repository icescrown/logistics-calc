import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class Country extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public iso_code!: string;
  public official_name_en!: string;
  public continent!: string;
  public status!: number;
  public readonly create_time!: Date;
  public readonly update_time!: Date;
}

Country.init(
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
    iso_code: {
      type: DataTypes.STRING(10),
      unique: true,
      allowNull: false,
    },
    official_name_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    continent: {
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
    tableName: 'country',
    timestamps: false,
  }
);

export default Country;