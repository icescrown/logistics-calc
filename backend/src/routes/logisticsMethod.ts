import express from 'express';
import logisticsMethodController from '../controllers/logisticsMethod';

const router = express.Router();

// 获取所有物流方式
router.get('/', logisticsMethodController.getAllLogisticsMethods);

// 获取单个物流方式
router.get('/:id', logisticsMethodController.getLogisticsMethodById);

// 根据承运商获取物流方式
router.get('/carrier/:carrierId', logisticsMethodController.getLogisticsMethodsByCarrier);

// 创建物流方式
router.post('/', logisticsMethodController.createLogisticsMethod);

// 更新物流方式
router.put('/:id', logisticsMethodController.updateLogisticsMethod);

// 删除物流方式
router.delete('/:id', logisticsMethodController.deleteLogisticsMethod);

// 启用/禁用物流方式
router.patch('/:id/status', logisticsMethodController.updateLogisticsMethodStatus);

export default router;