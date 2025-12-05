"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logisticsMethod_1 = __importDefault(require("../controllers/logisticsMethod"));
const router = express_1.default.Router();
// 获取所有物流方式
router.get('/', logisticsMethod_1.default.getAllLogisticsMethods);
// 获取单个物流方式
router.get('/:id', logisticsMethod_1.default.getLogisticsMethodById);
// 根据承运商获取物流方式
router.get('/carrier/:carrierId', logisticsMethod_1.default.getLogisticsMethodsByCarrier);
// 创建物流方式
router.post('/', logisticsMethod_1.default.createLogisticsMethod);
// 更新物流方式
router.put('/:id', logisticsMethod_1.default.updateLogisticsMethod);
// 删除物流方式
router.delete('/:id', logisticsMethod_1.default.deleteLogisticsMethod);
// 启用/禁用物流方式
router.patch('/:id/status', logisticsMethod_1.default.updateLogisticsMethodStatus);
exports.default = router;
//# sourceMappingURL=logisticsMethod.js.map