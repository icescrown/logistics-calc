import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import sequelize from './utils/db';
import warehouseRoutes from './routes/warehouse';
import carrierRoutes from './routes/carrier';
import logisticsMethodRoutes from './routes/logisticsMethod';
import regionRoutes from './routes/region';
import quotationRoutes from './routes/quotation';
import calculationRoutes from './routes/calculation';
import postalCodeRoutes from './routes/postalCode';
// 导入并初始化模型关联
import './models/associations';


// 加载环境变量
dotenv.config({ path: '../.env' });

// 创建Express应用
const app = express();

// 中间件配置
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由配置
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/carrier', carrierRoutes);
app.use('/api/logistics-method', logisticsMethodRoutes);
app.use('/api/region', regionRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/calculation', calculationRoutes);
app.use('/api/postalCode', postalCodeRoutes);

// 健康检查路由
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'ok', message: 'Logistics API is running' });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 仅测试数据库连接，不执行完整初始化
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();