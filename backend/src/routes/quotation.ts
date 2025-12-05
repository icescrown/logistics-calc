import express from 'express';
import quotationController from '../controllers/quotation';

const router = express.Router();

// 获取所有报价
router.get('/', quotationController.getAllQuotations);

// 获取单个报价
router.get('/:id', quotationController.getQuotationById);

// 根据条件获取报价
router.get('/search', quotationController.searchQuotations);

// 创建报价
router.post('/', quotationController.createQuotation);

// 更新报价
router.put('/:id', quotationController.updateQuotation);

// 删除报价
router.delete('/:id', quotationController.deleteQuotation);

// 启用/禁用报价
router.patch('/:id/status', quotationController.updateQuotationStatus);

// 导入报价
router.post('/import', quotationController.importQuotations);

// 导出报价
router.get('/export', quotationController.exportQuotations);

export default router;