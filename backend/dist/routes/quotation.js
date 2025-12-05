"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quotation_1 = __importDefault(require("../controllers/quotation"));
const router = express_1.default.Router();
// 获取所有报价
router.get('/', quotation_1.default.getAllQuotations);
// 获取单个报价
router.get('/:id', quotation_1.default.getQuotationById);
// 根据条件获取报价
router.get('/search', quotation_1.default.searchQuotations);
// 创建报价
router.post('/', quotation_1.default.createQuotation);
// 更新报价
router.put('/:id', quotation_1.default.updateQuotation);
// 删除报价
router.delete('/:id', quotation_1.default.deleteQuotation);
// 启用/禁用报价
router.patch('/:id/status', quotation_1.default.updateQuotationStatus);
// 导入报价
router.post('/import', quotation_1.default.importQuotations);
// 导出报价
router.get('/export', quotation_1.default.exportQuotations);
exports.default = router;
//# sourceMappingURL=quotation.js.map