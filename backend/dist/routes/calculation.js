"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const calculation_1 = __importDefault(require("../controllers/calculation"));
const router = express_1.default.Router();
// 计算物流方案
router.post('/calculate', calculation_1.default.calculateLogisticsPlan);
// 获取价格明细
router.post('/price-detail', calculation_1.default.getPriceDetail);
exports.default = router;
//# sourceMappingURL=calculation.js.map