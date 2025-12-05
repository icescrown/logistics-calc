// 模型关联配置文件
// 用于避免循环依赖问题，统一管理所有模型关联

import Quotation from './Quotation';
import QuotationAdditionalFee from './QuotationAdditionalFee';
import QuotationWeightRange from './QuotationWeightRange';
import AdditionalFee from './AdditionalFee';
import Region from './Region';
import PostalCode from './PostalCode';
import RegionPostalCode from './RegionPostalCode';

// 定义PostalCode与Region的多对多关系
// Region端的关联已在Region模型中定义，这里仅定义PostalCode端
PostalCode.belongsToMany(Region, {
  through: RegionPostalCode,
  foreignKey: 'postal_code_id',
  otherKey: 'region_id',
  as: 'regions',
});

// 定义Quotation与QuotationAdditionalFee的一对多关系
// Quotation端的关联已在Quotation模型中定义，这里仅定义QuotationAdditionalFee端
QuotationAdditionalFee.belongsTo(Quotation, {
  foreignKey: 'quotation_id',
  as: 'quotation',
});

// 定义QuotationAdditionalFee与AdditionalFee的一对一关系
QuotationAdditionalFee.belongsTo(AdditionalFee, {
  foreignKey: 'additional_fee_id',
  as: 'additional_fee',
});

// 定义Quotation与QuotationAdditionalFee的一对多关系（Quotation端）
Quotation.hasMany(QuotationAdditionalFee, {
  foreignKey: 'quotation_id',
  as: 'quotation_additional_fees',
});

// 导出空对象，仅用于执行关联配置
// eslint-disable-next-line import/no-anonymous-default-export
export default {};