import express from 'express';
import postalCodeController from '../controllers/postalCode';

const router = express.Router();

// 获取所有邮政编码
router.get('/', postalCodeController.getAllPostalCodes);

// 获取单个邮政编码
router.get('/:id', postalCodeController.getPostalCodeById);

// 创建邮政编码
router.post('/', postalCodeController.createPostalCode);

// 更新邮政编码
router.put('/:id', postalCodeController.updatePostalCode);

// 删除邮政编码
router.delete('/:id', postalCodeController.deletePostalCode);

// 启用/禁用邮政编码
router.patch('/:id/status', postalCodeController.updatePostalCodeStatus);

export default router;