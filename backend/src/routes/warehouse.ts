import express from 'express';
import warehouseController from '../controllers/warehouse';

const router = express.Router();

// 获取所有仓库
router.get('/', warehouseController.getAllWarehouses);

// 获取单个仓库
router.get('/:id', warehouseController.getWarehouseById);

// 创建仓库
router.post('/', warehouseController.createWarehouse);

// 更新仓库
router.put('/:id', warehouseController.updateWarehouse);

// 删除仓库
router.delete('/:id', warehouseController.deleteWarehouse);

// 启用/禁用仓库
router.patch('/:id/status', warehouseController.updateWarehouseStatus);

export default router;