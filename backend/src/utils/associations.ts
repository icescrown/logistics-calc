import Quotation from '../models/Quotation';
import QuotationAdditionalFee from '../models/QuotationAdditionalFee';
import QuotationWeightRange from '../models/QuotationWeightRange';
import AdditionalFee from '../models/AdditionalFee';
import Carrier from '../models/Carrier';
import LogisticsMethod from '../models/LogisticsMethod';
import Region from '../models/Region';

// 定义所有模型关联
const defineAssociations = () => {
  // Quotation 关联
  Quotation.belongsTo(Carrier, { foreignKey: 'carrier_id', as: 'carrier' });
  Quotation.belongsTo(LogisticsMethod, { foreignKey: 'logistics_method_id', as: 'logistics_method' });
  Quotation.belongsTo(Region, { foreignKey: 'region_id', as: 'region' });
  Quotation.hasMany(QuotationAdditionalFee, { foreignKey: 'quotation_id', as: 'quotation_additional_fees' });
  Quotation.hasMany(QuotationWeightRange, { foreignKey: 'quotation_id', as: 'quotation_weight_ranges' });

  // QuotationAdditionalFee 关联
  QuotationAdditionalFee.belongsTo(Quotation, { foreignKey: 'quotation_id', as: 'quotation' });
  QuotationAdditionalFee.belongsTo(AdditionalFee, { foreignKey: 'additional_fee_id', as: 'additional_fee' });

  // AdditionalFee 关联
  AdditionalFee.hasMany(QuotationAdditionalFee, { foreignKey: 'additional_fee_id', as: 'quotation_additional_fees' });

  // QuotationWeightRange 关联
  QuotationWeightRange.belongsTo(Quotation, { foreignKey: 'quotation_id', as: 'quotation' });
};

export default defineAssociations;