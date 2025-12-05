import express from 'express';
import calculationController from '../controllers/calculation';

const router = express.Router();

// 计算物流方案
router.post('/calculate', calculationController.calculateLogisticsPlan);

// 获取价格明细
router.post('/price-detail', calculationController.getPriceDetail);

export default router;