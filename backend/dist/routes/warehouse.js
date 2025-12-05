"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const warehouse_1 = __importDefault(require("../controllers/warehouse"));
const router = express_1.default.Router();
// 获取所有仓库
router.get('/', warehouse_1.default.getAllWarehouses);
// 获取单个仓库
router.get('/:id', warehouse_1.default.getWarehouseById);
// 创建仓库
router.post('/', warehouse_1.default.createWarehouse);
// 更新仓库
router.put('/:id', warehouse_1.default.updateWarehouse);
// 删除仓库
router.delete('/:id', warehouse_1.default.deleteWarehouse);
// 启用/禁用仓库
router.patch('/:id/status', warehouse_1.default.updateWarehouseStatus);
exports.default = router;
//# sourceMappingURL=warehouse.js.map