"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const region_1 = __importDefault(require("../controllers/region"));
const router = express_1.default.Router();
// 获取所有区域
router.get('/', region_1.default.getAllRegions);
// 获取单个区域
router.get('/:id', region_1.default.getRegionById);
// 创建区域
router.post('/', region_1.default.createRegion);
// 更新区域
router.put('/:id', region_1.default.updateRegion);
// 删除区域
router.delete('/:id', region_1.default.deleteRegion);
// 启用/禁用区域
router.patch('/:id/status', region_1.default.updateRegionStatus);
// 获取所有国家（用于选择）
router.get('/countries/all', region_1.default.getAllCountries);
// 根据国家ID获取邮政编码
router.get('/postal-codes/:countryId', region_1.default.getPostalCodesByCountryId);
exports.default = router;
//# sourceMappingURL=region.js.map