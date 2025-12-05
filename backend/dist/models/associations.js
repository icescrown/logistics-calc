"use strict";
// 模型关联配置文件
// 用于避免循环依赖问题，统一管理所有模型关联
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Quotation_1 = __importDefault(require("./Quotation"));
const QuotationAdditionalFee_1 = __importDefault(require("./QuotationAdditionalFee"));
const AdditionalFee_1 = __importDefault(require("./AdditionalFee"));
const Region_1 = __importDefault(require("./Region"));
const PostalCode_1 = __importDefault(require("./PostalCode"));
const RegionPostalCode_1 = __importDefault(require("./RegionPostalCode"));
// 定义PostalCode与Region的多对多关系
// Region端的关联已在Region模型中定义，这里仅定义PostalCode端
PostalCode_1.default.belongsToMany(Region_1.default, {
    through: RegionPostalCode_1.default,
    foreignKey: 'postal_code_id',
    otherKey: 'region_id',
    as: 'regions',
});
// 定义Quotation与QuotationAdditionalFee的一对多关系
// Quotation端的关联已在Quotation模型中定义，这里仅定义QuotationAdditionalFee端
QuotationAdditionalFee_1.default.belongsTo(Quotation_1.default, {
    foreignKey: 'quotation_id',
    as: 'quotation',
});
// 定义QuotationAdditionalFee与AdditionalFee的一对一关系
QuotationAdditionalFee_1.default.belongsTo(AdditionalFee_1.default, {
    foreignKey: 'additional_fee_id',
    as: 'additional_fee',
});
// 定义Quotation与QuotationAdditionalFee的一对多关系（Quotation端）
Quotation_1.default.hasMany(QuotationAdditionalFee_1.default, {
    foreignKey: 'quotation_id',
    as: 'quotation_additional_fees',
});
// 导出空对象，仅用于执行关联配置
// eslint-disable-next-line import/no-anonymous-default-export
exports.default = {};
//# sourceMappingURL=associations.js.map