"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Quotation_1 = __importDefault(require("../models/Quotation"));
const Carrier_1 = __importDefault(require("../models/Carrier"));
const LogisticsMethod_1 = __importDefault(require("../models/LogisticsMethod"));
const Region_1 = __importDefault(require("../models/Region"));
const Country_1 = __importDefault(require("../models/Country"));
const QuotationAdditionalFee_1 = __importDefault(require("../models/QuotationAdditionalFee"));
const AdditionalFee_1 = __importDefault(require("../models/AdditionalFee"));
const QuotationWeightRange_1 = __importDefault(require("../models/QuotationWeightRange"));
const PostalCode_1 = __importDefault(require("../models/PostalCode"));
const RegionPostalCode_1 = __importDefault(require("../models/RegionPostalCode"));
// 物流方案计算控制器
const calculationController = {
    // 计算物流方案
    calculateLogisticsPlan: async (req, res) => {
        try {
            const { warehouse_id, weight, volume, insurance_needed, declared_value, country, province, city, street, detail_address, postal_code } = req.body;
            // 验证必填字段
            if (!warehouse_id || !weight || !volume || !country || !city || !postal_code) {
                res.status(400).json({ status: 'error', message: 'Required fields are missing' });
                return;
            }
            // 1. 严格执行国家有效性验证流程
            // 预处理用户输入的国家信息，去除空格并转换为大写，确保匹配准确性
            const processedCountry = country.trim().toUpperCase();
            // 1.1 首先验证国家是否存在
            let countryRecord;
            // 调试：输出处理后的国家信息
            console.log(`[DEBUG] 处理前国家: ${country}, 处理后国家: ${processedCountry}`);
            // 尝试通过国家名称、国家代码和ISO代码匹配国家
            const matchedCountries = await Country_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        // 国家名称匹配（最精确）
                        {
                            name: { [sequelize_1.Op.or]: [
                                    { [sequelize_1.Op.eq]: processedCountry },
                                    { [sequelize_1.Op.eq]: country.trim() }
                                ] }
                        },
                        // 国家代码匹配
                        {
                            code: { [sequelize_1.Op.or]: [
                                    { [sequelize_1.Op.eq]: processedCountry },
                                    { [sequelize_1.Op.eq]: country.trim().toUpperCase() }
                                ] }
                        },
                        // ISO代码匹配
                        {
                            iso_code: { [sequelize_1.Op.or]: [
                                    { [sequelize_1.Op.eq]: processedCountry },
                                    { [sequelize_1.Op.eq]: country.trim().toUpperCase() }
                                ] }
                        }
                    ],
                    status: 1
                }
            });
            // 调试：输出匹配到的国家
            console.log(`[DEBUG] 匹配到的国家数量: ${matchedCountries.length} 个`);
            console.log(`[DEBUG] 匹配到的国家详情: ${JSON.stringify(matchedCountries.map(c => ({ id: c.id, name: c.name, code: c.code, iso_code: c.iso_code })))}`);
            // 如果没有找到匹配的国家，返回错误信息
            if (matchedCountries.length === 0) {
                res.status(400).json({
                    status: 'error',
                    message: '未找到匹配的国家信息，请检查输入的国家名称或代码是否正确'
                });
                return;
            }
            // 选择最优匹配结果
            // 优先级：1. 国家名称完全匹配 2. 国家代码完全匹配 3. ISO代码完全匹配
            countryRecord = matchedCountries[0];
            for (const record of matchedCountries) {
                // 精确匹配国家名称（最优先）
                if (record.name.toUpperCase() === processedCountry || record.name === country.trim()) {
                    countryRecord = record;
                    break;
                }
                // 精确匹配国家代码
                if (record.code.toUpperCase() === processedCountry) {
                    countryRecord = record;
                    break;
                }
                // 精确匹配ISO代码
                if (record.iso_code.toUpperCase() === processedCountry) {
                    countryRecord = record;
                    break;
                }
            }
            if (!countryRecord) {
                res.status(400).json({
                    status: 'error',
                    message: '未找到匹配的国家信息，请检查输入的国家名称或代码是否正确'
                });
                return;
            }
            const countryId = countryRecord.id;
            console.log(`[DEBUG] 国家匹配成功: ${country} -> ${countryRecord.name} (ID: ${countryId})`);
            // 1.2 验证国家是否存在于区域管理配置的关联国家列表中
            console.log(`[DEBUG] 开始验证国家是否存在于区域管理配置的关联国家列表中`);
            // 优化：查询所有关联了该国家的区域，确保验证逻辑正确读取并应用最新的区域管理配置数据
            // 使用更严谨的查询方式，确保只获取有效的关联关系
            const countryRegions = await Region_1.default.findAll({
                include: [
                    {
                        model: Country_1.default,
                        as: 'countries',
                        where: {
                            id: countryId,
                            status: 1
                        },
                        // 明确指定中间表，确保查询结果准确
                        through: {
                        // 使用已导入的RegionCountry中间表，只需要基础关联
                        },
                        // 限制只获取必要的字段，提高查询效率
                        attributes: ['id', 'name', 'code']
                    }
                ],
                where: {
                    status: 1
                },
                // 限制只获取必要的字段，提高查询效率
                attributes: ['id', 'name', 'code', 'type']
            });
            console.log(`[DEBUG] 国家 ${country} (ID: ${countryId}) 关联的区域数量: ${countryRegions.length} 个`);
            // 2. 严格执行前置验证机制
            // 若收件国家未通过验证，立即终止费用计算流程
            if (countryRegions.length === 0) {
                res.status(400).json({
                    status: 'error',
                    message: `所选国家 [${country}] 不在区域管理配置的关联国家列表中，无法计算物流费用。请联系系统管理员检查区域管理配置。`
                });
                return;
            }
            // 获取目标区域列表
            let regionIds = [];
            // 输出调试信息
            countryRegions.forEach(region => {
                console.log(`[DEBUG]   - 区域名称: ${region.name}, ID: ${region.id}, 类型: ${region.type}`);
                // 调试输出区域关联的所有国家，便于验证匹配结果
                const regionCountries = region.countries || [];
                const countryNames = regionCountries.map(c => `${c.name} (ID: ${c.id})`).join(', ');
                console.log(`[DEBUG]     区域关联的所有国家: ${countryNames}`);
            });
            // 按类型排序，优先处理"邮编"类型的区域
            countryRegions.sort((a, b) => {
                // 让"邮编"类型的区域排在前面
                if (a.type === '邮编' || a.type === 'postal_code' || a.type === 'zipcode')
                    return -1;
                if (b.type === '邮编' || b.type === 'postal_code' || b.type === 'zipcode')
                    return 1;
                return 0;
            });
            // 2. 邮编匹配逻辑优化
            if (countryRegions.length > 0) {
                // 定义邮编类型的所有可能表述，支持中英文
                const ZIP_REGION_TYPES = ['邮编', 'postal_code', 'zipcode'];
                // 分类处理不同类型的区域
                const zipRegions = countryRegions.filter(region => ZIP_REGION_TYPES.includes(region.type.toLowerCase()));
                const otherRegions = countryRegions.filter(region => !ZIP_REGION_TYPES.includes(region.type.toLowerCase()));
                console.log(`[DEBUG] 区域分类: 邮编类型区域 ${zipRegions.length} 个, 其他类型区域 ${otherRegions.length} 个`);
                // 标记是否已经匹配到邮编类型的区域
                let hasMatchedZipRegion = false;
                // 预处理邮编，去除空格并转换为大写，确保匹配准确性
                const processedPostalCode = postal_code?.trim().toUpperCase() || '';
                // 1. 先处理邮编类型的区域
                if (zipRegions.length > 0 && processedPostalCode) {
                    console.log(`[DEBUG] 开始处理邮编类型区域，邮编: ${processedPostalCode}`);
                    for (const region of zipRegions) {
                        console.log(`[DEBUG]   处理区域: ${region.name} (ID: ${region.id}), 类型: ${region.type}`);
                        // 获取该区域关联的所有邮编记录，限定当前国家
                        // 先查询中间表获取与该区域关联的邮编ID
                        const regionPostalCodeRelations = await RegionPostalCode_1.default.findAll({
                            where: {
                                region_id: region.id
                            }
                        });
                        // 提取邮编ID列表
                        const postalCodeIds = regionPostalCodeRelations.map(relation => relation.postal_code_id);
                        console.log(`[DEBUG]     区域关联的邮编ID数量: ${postalCodeIds.length} 个`);
                        // 查询对应的邮编记录
                        // 注意：这里移除了country_id条件，因为RegionPostalCode中间表已经确保了区域和邮编的关联
                        // 不同国家可能有相同的邮编格式，应该允许跨国家匹配
                        const regionPostalCodes = await PostalCode_1.default.findAll({
                            where: {
                                id: postalCodeIds,
                                status: 1
                            }
                        });
                        // 调试：输出查询到的邮编记录详情
                        console.log(`[DEBUG]     查询到的邮编记录: ${JSON.stringify(regionPostalCodes.map(pc => ({ id: pc.id, code: pc.code, country_id: pc.country_id })))}`);
                        console.log(`[DEBUG]     区域关联的邮编记录数量: ${regionPostalCodes.length} 个`);
                        // 验证邮编是否匹配
                        let isPostalCodeMatched = false;
                        for (const pcRecord of regionPostalCodes) {
                            const pattern = pcRecord.code;
                            console.log(`[DEBUG]     测试邮编模式: ${pattern}`);
                            // 预处理模式，去除空格并转换为大写
                            const processedPattern = pattern.trim().toUpperCase();
                            // 调试：输出处理后的模式和邮编
                            console.log(`[DEBUG]     - 处理后模式: ${processedPattern}, 处理后邮编: ${processedPostalCode}`);
                            // 精确匹配（最优先）
                            if (processedPattern === processedPostalCode) {
                                console.log(`[DEBUG]     - 精确匹配: 成功`);
                                isPostalCodeMatched = true;
                                break;
                            }
                            // 通配符匹配 (*)
                            if (processedPattern.includes('*')) {
                                // 构建正则表达式，处理通配符
                                const regexPattern = `^${processedPattern.replace(/\*/g, '.*')}$`;
                                const regex = new RegExp(regexPattern, 'i'); // 不区分大小写
                                const matchResult = regex.test(processedPostalCode);
                                console.log(`[DEBUG]     - 通配符匹配: ${matchResult ? '成功' : '失败'}, 正则: ${regexPattern}`);
                                if (matchResult) {
                                    isPostalCodeMatched = true;
                                    break;
                                }
                            }
                            // 范围匹配 (如 12300-12400)
                            if (processedPattern.includes('-')) {
                                const [minStr, maxStr] = processedPattern.split('-').map(p => p.trim());
                                const min = minStr?.trim() || '';
                                const max = maxStr?.trim() || '';
                                if (min && max) {
                                    const matchResult = processedPostalCode >= min && processedPostalCode <= max;
                                    console.log(`[DEBUG]     - 范围匹配: ${matchResult ? '成功' : '失败'}, 范围: ${min} - ${max}`);
                                    if (matchResult) {
                                        isPostalCodeMatched = true;
                                        break;
                                    }
                                }
                            }
                            // 新增：如果区域类型是邮编，但没有设置具体邮编，或者邮编为空，也视为匹配成功
                            // 这种情况适用于整个国家或地区都适用的区域
                            if (!processedPattern || processedPattern === '' || processedPattern === '*') {
                                console.log(`[DEBUG]     - 空模式匹配: 成功`);
                                isPostalCodeMatched = true;
                                break;
                            }
                        }
                        if (isPostalCodeMatched) {
                            console.log(`[DEBUG]     邮编匹配成功，添加区域: ${region.name} (ID: ${region.id})`);
                            regionIds.push(region.id);
                            hasMatchedZipRegion = true;
                        }
                        else {
                            console.log(`[DEBUG]     该区域的所有邮编模式均不匹配`);
                        }
                    }
                }
                // 2. 只有当没有匹配到邮编类型的区域时，才处理其他类型的区域
                if (!hasMatchedZipRegion && otherRegions.length > 0) {
                    console.log(`[DEBUG] 没有匹配到邮编类型的区域，开始处理其他类型区域`);
                    for (const region of otherRegions) {
                        console.log(`[DEBUG]   添加其他类型区域: ${region.name} (ID: ${region.id}), 类型: ${region.type}`);
                        regionIds.push(region.id);
                    }
                }
            }
            // 去重
            regionIds = [...new Set(regionIds)];
            // 如果还是没有找到区域，返回200状态码，包含空的物流方案和错误信息
            if (regionIds.length === 0) {
                // 返回200状态码，包含空的物流方案列表和错误信息
                const responseData = {
                    logistics_plans: [],
                    recommended_plan: null,
                    address_info: {
                        country,
                        province,
                        city,
                        street,
                        detail_address,
                        postal_code
                    },
                    calculation_info: {
                        weight: parseFloat(weight),
                        volume: parseFloat(volume),
                        insurance_needed: insurance_needed || false,
                        declared_value: declared_value ? parseFloat(declared_value) : 0,
                        matched_region_count: regionIds.length,
                        matched_plan_count: 0
                    },
                    error: 'No matching region found for the provided address'
                };
                res.status(200).json({
                    status: 'success',
                    data: responseData,
                });
                return;
            }
            // 构建查询条件
            const quotationWhere = {
                status: 1,
                warehouse_id: warehouse_id,
                effective_date: { [sequelize_1.Op.lte]: new Date() },
                expire_date: { [sequelize_1.Op.or]: [{ [sequelize_1.Op.gte]: new Date() }, { [sequelize_1.Op.is]: null }] },
            };
            // 如果有区域ID，添加到查询条件中
            if (regionIds.length > 0) {
                quotationWhere.region_id = { [sequelize_1.Op.in]: regionIds };
            }
            // 查询符合条件的报价
            const quotations = await Quotation_1.default.findAll({
                where: quotationWhere,
                include: [
                    { model: Carrier_1.default, as: 'carrier' },
                    { model: LogisticsMethod_1.default, as: 'logistics_method' },
                    { model: Region_1.default, as: 'region' },
                    {
                        model: QuotationAdditionalFee_1.default,
                        as: 'quotation_additional_fees',
                        include: [{ model: AdditionalFee_1.default, as: 'additional_fee' }],
                    },
                    // 这里暂时不包含QuotationWeightRange，因为需要先查询符合条件的报价，再处理重量范围
                ],
            });
            // 计算每个报价的总价格
            const logisticsPlans = [];
            for (const quotation of quotations) {
                // 首先获取该报价的所有重量范围
                const weightRanges = await QuotationWeightRange_1.default.findAll({
                    where: {
                        quotation_id: quotation.id
                    }
                });
                // 查找符合当前重量的重量范围
                const matchingWeightRange = weightRanges.find((range) => {
                    return weight >= range.weight_from && weight <= range.weight_to;
                });
                if (matchingWeightRange) {
                    // 如果找到匹配的重量范围，计算该报价的总价格
                    const quotationData = quotation.toJSON();
                    // 基础价格计算
                    const basePrice = parseFloat(matchingWeightRange.base_price.toString());
                    const discount = parseFloat(quotationData.discount.toString());
                    const discountedBasePrice = basePrice * discount;
                    let totalPrice = discountedBasePrice;
                    const additionalFees = [];
                    // 计算附加费用
                    if (quotationData.quotation_additional_fees && Array.isArray(quotationData.quotation_additional_fees)) {
                        for (const fee of quotationData.quotation_additional_fees) {
                            let feeAmount = parseFloat(fee.amount);
                            // 根据计算方式计算附加费用
                            switch (fee.additional_fee.calculation_method) {
                                case '按重量':
                                    feeAmount = feeAmount * parseFloat(weight);
                                    break;
                                case '按体积':
                                    feeAmount = feeAmount * parseFloat(volume);
                                    break;
                                // 默认是固定金额
                                default:
                                    break;
                            }
                            additionalFees.push({
                                name: fee.additional_fee.name,
                                type: fee.additional_fee.type,
                                amount: parseFloat(feeAmount.toFixed(2)),
                                calculation_method: fee.additional_fee.calculation_method,
                                base_amount: parseFloat(fee.amount),
                                calculation_details: fee.additional_fee.calculation_method === '按重量'
                                    ? `按重量计算：${fee.amount}元/kg × ${weight}kg`
                                    : fee.additional_fee.calculation_method === '按体积'
                                        ? `按体积计算：${fee.amount}元/m³ × ${volume}m³`
                                        : `固定费用：${fee.amount}元`
                            });
                            totalPrice += feeAmount;
                        }
                    }
                    // 如果需要保险，添加保险费用
                    if (insurance_needed && declared_value) {
                        const declaredValue = parseFloat(declared_value);
                        const insuranceRate = 0.01; // 1%的保险费率
                        const insuranceFee = declaredValue * insuranceRate;
                        additionalFees.push({
                            name: '保险费',
                            type: '保险费',
                            amount: parseFloat(insuranceFee.toFixed(2)),
                            calculation_method: '按价值',
                            base_amount: insuranceRate,
                            calculation_details: `按货物价值的${(insuranceRate * 100).toFixed(1)}%计算：${declaredValue}元 × ${(insuranceRate * 100).toFixed(1)}%`
                        });
                        totalPrice += insuranceFee;
                    }
                    logisticsPlans.push({
                        quotation_id: quotationData.id,
                        carrier: quotationData.carrier,
                        logistics_method: quotationData.logistics_method,
                        region: quotationData.region,
                        // 基础费用明细
                        base_price: basePrice,
                        discount: discount,
                        discounted_base_price: parseFloat(discountedBasePrice.toFixed(2)),
                        // 附加费用
                        additional_fees: additionalFees,
                        // 总费用
                        total_price: parseFloat(totalPrice.toFixed(2)),
                        // 重量体积信息
                        weight_from: parseFloat(matchingWeightRange.weight_from.toString()),
                        weight_to: parseFloat(matchingWeightRange.weight_to.toString()),
                        weight: parseFloat(weight),
                        volume: parseFloat(volume),
                        // 费用计算说明
                        calculation_explanation: {
                            base_price: `基础价格：${basePrice}元`,
                            discount: `折扣：${(discount * 100).toFixed(0)}折`,
                            discounted_base_price: `折扣后基础价格：${discountedBasePrice.toFixed(2)}元`,
                            total_additional_fees: `附加费用总计：${(totalPrice - discountedBasePrice).toFixed(2)}元`,
                            total_price: `总价格：${totalPrice.toFixed(2)}元`
                        }
                    });
                }
            }
            // 按总价格排序，推荐最优方案
            logisticsPlans.sort((a, b) => a.total_price - b.total_price);
            // 确保返回的数据包含完整的费用构成说明
            const responseData = {
                logistics_plans: logisticsPlans,
                recommended_plan: logisticsPlans[0] || null,
                address_info: {
                    country,
                    province,
                    city,
                    street,
                    detail_address,
                    postal_code
                },
                calculation_info: {
                    weight: parseFloat(weight),
                    volume: parseFloat(volume),
                    insurance_needed: insurance_needed || false,
                    declared_value: declared_value ? parseFloat(declared_value) : 0,
                    matched_region_count: regionIds.length,
                    matched_plan_count: logisticsPlans.length
                }
            };
            res.status(200).json({
                status: 'success',
                data: responseData,
            });
        }
        catch (error) {
            console.error('Failed to calculate logistics plan:', error);
            res.status(500).json({ status: 'error', message: 'Failed to calculate logistics plan' });
        }
    },
    // 获取价格明细
    getPriceDetail: async (req, res) => {
        try {
            const { quotation_id, weight, volume, insurance_needed, declared_value } = req.body;
            // 验证必填字段
            if (!quotation_id || !weight || !volume) {
                res.status(400).json({ status: 'error', message: 'Required fields are missing' });
                return;
            }
            // 查询报价
            const quotation = await Quotation_1.default.findByPk(quotation_id, {
                include: [
                    { model: Carrier_1.default, as: 'carrier' },
                    { model: LogisticsMethod_1.default, as: 'logistics_method' },
                    { model: Region_1.default, as: 'region' },
                    {
                        model: QuotationAdditionalFee_1.default,
                        as: 'quotation_additional_fees',
                        include: [{ model: AdditionalFee_1.default, as: 'additional_fee' }],
                    },
                ],
            });
            if (!quotation) {
                res.status(404).json({ status: 'error', message: 'Quotation not found' });
                return;
            }
            // 获取该报价的所有重量范围
            const weightRanges = await QuotationWeightRange_1.default.findAll({
                where: {
                    quotation_id: quotation.id
                }
            });
            // 查找符合当前重量的重量范围
            const matchingWeightRange = weightRanges.find((range) => {
                return weight >= range.weight_from && weight <= range.weight_to;
            });
            if (!matchingWeightRange) {
                res.status(404).json({ status: 'error', message: 'No matching weight range found' });
                return;
            }
            const quotationData = quotation.toJSON();
            let totalPrice = matchingWeightRange.base_price * parseFloat(quotationData.discount);
            const additionalFees = [];
            // 计算附加费用
            if (quotationData.quotation_additional_fees && Array.isArray(quotationData.quotation_additional_fees)) {
                for (const fee of quotationData.quotation_additional_fees) {
                    let feeAmount = parseFloat(fee.amount);
                    // 根据计算方式计算附加费用
                    switch (fee.additional_fee.calculation_method) {
                        case '按重量':
                            feeAmount = feeAmount * parseFloat(weight);
                            break;
                        case '按体积':
                            feeAmount = feeAmount * parseFloat(volume);
                            break;
                        // 默认是固定金额
                        default:
                            break;
                    }
                    additionalFees.push({
                        name: fee.additional_fee.name,
                        type: fee.additional_fee.type,
                        amount: parseFloat(feeAmount.toFixed(2)),
                        calculation_method: fee.additional_fee.calculation_method,
                    });
                    totalPrice += feeAmount;
                }
            }
            // 如果需要保险，添加保险费用
            if (insurance_needed && declared_value) {
                const insuranceFee = parseFloat(declared_value) * 0.01;
                additionalFees.push({
                    name: '保险费',
                    type: '保险费',
                    amount: parseFloat(insuranceFee.toFixed(2)),
                    calculation_method: '按价值',
                });
                totalPrice += insuranceFee;
            }
            // 构建价格明细
            const priceDetail = {
                quotation_id: quotationData.id,
                carrier: quotationData.carrier,
                logistics_method: quotationData.logistics_method,
                region: quotationData.region,
                weight: parseFloat(weight),
                volume: parseFloat(volume),
                base_price: parseFloat(matchingWeightRange.base_price.toString()),
                discount: parseFloat(quotationData.discount.toString()),
                discounted_price: parseFloat((matchingWeightRange.base_price * parseFloat(quotationData.discount.toString())).toFixed(2)),
                additional_fees: additionalFees,
                total_price: parseFloat(totalPrice.toFixed(2)),
                insurance_needed: insurance_needed,
                declared_value: declared_value ? parseFloat(declared_value) : 0,
                weight_from: parseFloat(matchingWeightRange.weight_from.toString()),
                weight_to: parseFloat(matchingWeightRange.weight_to.toString()),
            };
            res.status(200).json({ status: 'success', data: priceDetail });
        }
        catch (error) {
            console.error('Failed to get price detail:', error);
            res.status(500).json({ status: 'error', message: 'Failed to get price detail' });
        }
    },
};
exports.default = calculationController;
//# sourceMappingURL=calculation.js.map