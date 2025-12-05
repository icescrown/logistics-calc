import express from 'express';
import carrierController from '../controllers/carrier';

const router = express.Router();

// 获取所有承运商
router.get('/', carrierController.getAllCarriers);

// 获取单个承运商
router.get('/:id', carrierController.getCarrierById);

// 创建承运商
router.post('/', carrierController.createCarrier);

// 更新承运商
router.put('/:id', carrierController.updateCarrier);

// 删除承运商
router.delete('/:id', carrierController.deleteCarrier);

// 启用/禁用承运商
router.patch('/:id/status', carrierController.updateCarrierStatus);

export default router;