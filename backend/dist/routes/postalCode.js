"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postalCode_1 = __importDefault(require("../controllers/postalCode"));
const router = express_1.default.Router();
// 获取所有邮政编码
router.get('/', postalCode_1.default.getAllPostalCodes);
// 获取单个邮政编码
router.get('/:id', postalCode_1.default.getPostalCodeById);
// 创建邮政编码
router.post('/', postalCode_1.default.createPostalCode);
// 更新邮政编码
router.put('/:id', postalCode_1.default.updatePostalCode);
// 删除邮政编码
router.delete('/:id', postalCode_1.default.deletePostalCode);
// 启用/禁用邮政编码
router.patch('/:id/status', postalCode_1.default.updatePostalCodeStatus);
exports.default = router;
//# sourceMappingURL=postalCode.js.map