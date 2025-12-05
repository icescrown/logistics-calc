"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const carrier_1 = __importDefault(require("../controllers/carrier"));
const router = express_1.default.Router();
// 获取所有承运商
router.get('/', carrier_1.default.getAllCarriers);
// 获取单个承运商
router.get('/:id', carrier_1.default.getCarrierById);
// 创建承运商
router.post('/', carrier_1.default.createCarrier);
// 更新承运商
router.put('/:id', carrier_1.default.updateCarrier);
// 删除承运商
router.delete('/:id', carrier_1.default.deleteCarrier);
// 启用/禁用承运商
router.patch('/:id/status', carrier_1.default.updateCarrierStatus);
exports.default = router;
//# sourceMappingURL=carrier.js.map