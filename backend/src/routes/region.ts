import express from 'express';
import regionController from '../controllers/region';

const router = express.Router();

// 获取所有区域
router.get('/', regionController.getAllRegions);

// 获取单个区域
router.get('/:id', regionController.getRegionById);

// 创建区域
router.post('/', regionController.createRegion);

// 更新区域
router.put('/:id', regionController.updateRegion);

// 删除区域
router.delete('/:id', regionController.deleteRegion);

// 启用/禁用区域
router.patch('/:id/status', regionController.updateRegionStatus);

// 获取所有国家（用于选择）
router.get('/countries/all', regionController.getAllCountries);

// 根据国家ID获取邮政编码
router.get('/postal-codes/:countryId', regionController.getPostalCodesByCountryId);

export default router;