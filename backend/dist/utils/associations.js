"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Quotation_1 = __importDefault(require("../models/Quotation"));
const QuotationAdditionalFee_1 = __importDefault(require("../models/QuotationAdditionalFee"));
const QuotationWeightRange_1 = __importDefault(require("../models/QuotationWeightRange"));
const AdditionalFee_1 = __importDefault(require("../models/AdditionalFee"));
const Carrier_1 = __importDefault(require("../models/Carrier"));
const LogisticsMethod_1 = __importDefault(require("../models/LogisticsMethod"));
const Region_1 = __importDefault(require("../models/Region"));
// 定义所有模型关联
const defineAssociations = () => {
    // Quotation 关联
    Quotation_1.default.belongsTo(Carrier_1.default, { foreignKey: 'carrier_id', as: 'carrier' });
    Quotation_1.default.belongsTo(LogisticsMethod_1.default, { foreignKey: 'logistics_method_id', as: 'logistics_method' });
    Quotation_1.default.belongsTo(Region_1.default, { foreignKey: 'region_id', as: 'region' });
    Quotation_1.default.hasMany(QuotationAdditionalFee_1.default, { foreignKey: 'quotation_id', as: 'quotation_additional_fees' });
    Quotation_1.default.hasMany(QuotationWeightRange_1.default, { foreignKey: 'quotation_id', as: 'quotation_weight_ranges' });
    // QuotationAdditionalFee 关联
    QuotationAdditionalFee_1.default.belongsTo(Quotation_1.default, { foreignKey: 'quotation_id', as: 'quotation' });
    QuotationAdditionalFee_1.default.belongsTo(AdditionalFee_1.default, { foreignKey: 'additional_fee_id', as: 'additional_fee' });
    // AdditionalFee 关联
    AdditionalFee_1.default.hasMany(QuotationAdditionalFee_1.default, { foreignKey: 'additional_fee_id', as: 'quotation_additional_fees' });
    // QuotationWeightRange 关联
    QuotationWeightRange_1.default.belongsTo(Quotation_1.default, { foreignKey: 'quotation_id', as: 'quotation' });
};
exports.default = defineAssociations;
//# sourceMappingURL=associations.js.map