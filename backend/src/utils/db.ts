import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const sequelize = new Sequelize({
  database: process.env.db_name || 'logistics',
  username: process.env.db_user || 'root',
  password: process.env.db_password || 'root',
  host: process.env.db_host || 'localhost',
  port: parseInt(process.env.db_port || '3306'),
  dialect: 'mysql',
  logging: false,
});

export default sequelize;