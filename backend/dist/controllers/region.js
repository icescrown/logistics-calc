"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Region_1 = __importDefault(require("../models/Region"));
const Country_1 = __importDefault(require("../models/Country"));
const PostalCode_1 = __importDefault(require("../models/PostalCode"));
const RegionCountry_1 = __importDefault(require("../models/RegionCountry"));
const RegionPostalCode_1 = __importDefault(require("../models/RegionPostalCode"));
const regionController = {
    // 获取所有区域
    getAllRegions: async (req, res) => {
        try {
            const { page = 1, page_size = 10, keyword = '' } = req.query;
            const pageInt = parseInt(page, 10);
            const pageSizeInt = parseInt(page_size, 10);
            const offset = (pageInt - 1) * pageSizeInt;
            // 构建查询条件
            const where = {};
            if (keyword) {
                where[sequelize_1.Op.or] = [
                    { name: { [sequelize_1.Op.like]: `%${keyword}%` } },
                    { code: { [sequelize_1.Op.like]: `%${keyword}%` } },
                ];
            }
            // 获取总记录数
            const total = await Region_1.default.count({ where });
            // 获取分页数据，包含关联的国家和邮政编码
            const regions = await Region_1.default.findAll({
                where,
                order: [['create_time', 'DESC']],
                offset,
                limit: pageSizeInt,
                include: [
                    {
                        model: Country_1.default,
                        as: 'countries',
                        through: { attributes: [] },
                        attributes: ['id', 'name', 'code', 'iso_code']
                    },
                    {
                        model: PostalCode_1.default,
                        as: 'postalCodes',
                        through: { attributes: [] },
                        attributes: ['id', 'code', 'country_id']
                    }
                ],
            });
            res.status(200).json({
                status: 'success',
                data: {
                    list: regions,
                    total,
                    page: pageInt,
                    page_size: pageSizeInt
                }
            });
        }
        catch (error) {
            console.error('获取区域失败:', error);
            res.status(500).json({ status: 'error', message: 'Failed to get regions' });
        }
    },
    // 获取单个区域
    getRegionById: async (req, res) => {
        try {
            const { id } = req.params;
            const region = await Region_1.default.findByPk(id, {
                include: [
                    {
                        model: Country_1.default,
                        as: 'countries',
                        through: { attributes: [] },
                        attributes: ['id', 'name', 'code', 'iso_code']
                    },
                    {
                        model: PostalCode_1.default,
                        as: 'postalCodes',
                        through: { attributes: [] },
                        attributes: ['id', 'code', 'country_id']
                    }
                ],
            });
            if (!region) {
                res.status(404).json({ status: 'error', message: 'Region not found' });
                return;
            }
            res.status(200).json({ status: 'success', data: region });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to get region' });
        }
    },
    // 创建区域
    createRegion: async (req, res) => {
        try {
            const { name, code, type, country_ids = [], postal_code_ids = [], postal_code_text = '' } = req.body;
            // 验证必填字段
            if (!name || !code) {
                res.status(400).json({ status: 'error', message: 'Name and code are required' });
                return;
            }
            // 检查code是否已存在
            const existingRegion = await Region_1.default.findOne({ where: { code } });
            if (existingRegion) {
                res.status(400).json({ status: 'error', message: 'Region code already exists' });
                return;
            }
            // 创建区域
            const region = await Region_1.default.create({
                name,
                code,
                type,
                status: 1,
            });
            // 关联国家
            if (country_ids && country_ids.length > 0) {
                const regionCountries = country_ids.map((countryId) => ({
                    region_id: region.id,
                    country_id: countryId
                }));
                await RegionCountry_1.default.bulkCreate(regionCountries);
            }
            // 处理邮政编码关联
            let finalPostalCodeIds = [...postal_code_ids];
            // 如果有邮政编码文本输入，解析并创建/获取对应的邮政编码记录
            if (postal_code_text && postal_code_text.trim()) {
                // 解析邮政编码文本
                const postalCodePatterns = postal_code_text.trim().split(/[,\s]+/).filter((pc) => pc.trim());
                // 处理每个邮政编码模式
                for (const pattern of postalCodePatterns) {
                    // 检查是否已存在该邮政编码
                    let postalCode = await PostalCode_1.default.findOne({ where: { code: pattern } });
                    // 如果不存在，创建新的邮政编码记录
                    if (!postalCode) {
                        // 为每个选中国家创建邮政编码记录
                        for (const countryId of country_ids) {
                            postalCode = await PostalCode_1.default.create({
                                code: pattern,
                                country_id: countryId,
                                status: 1
                            });
                            finalPostalCodeIds.push(postalCode.id);
                        }
                    }
                    else {
                        // 如果已存在，添加到关联列表
                        finalPostalCodeIds.push(postalCode.id);
                    }
                }
            }
            // 关联邮政编码
            if (finalPostalCodeIds && finalPostalCodeIds.length > 0) {
                // 去重
                const uniquePostalCodeIds = [...new Set(finalPostalCodeIds)];
                const regionPostalCodes = uniquePostalCodeIds.map((postalCodeId) => ({
                    region_id: region.id,
                    postal_code_id: postalCodeId
                }));
                await RegionPostalCode_1.default.bulkCreate(regionPostalCodes);
            }
            // 重新查询包含关联数据的区域
            const createdRegion = await Region_1.default.findByPk(region.id, {
                include: [
                    {
                        model: Country_1.default,
                        as: 'countries',
                        through: { attributes: [] },
                        attributes: ['id', 'name', 'code', 'iso_code']
                    },
                    {
                        model: PostalCode_1.default,
                        as: 'postalCodes',
                        through: { attributes: [] },
                        attributes: ['id', 'code', 'country_id']
                    }
                ],
            });
            res.status(201).json({ status: 'success', data: createdRegion });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to create region' });
        }
    },
    // 更新区域
    updateRegion: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, code, type, country_ids = [], postal_code_ids = [], postal_code_text = '' } = req.body;
            const region = await Region_1.default.findByPk(id);
            if (!region) {
                res.status(404).json({ status: 'error', message: 'Region not found' });
                return;
            }
            // 检查code是否已存在（排除当前区域）
            if (code && code !== region.code) {
                const existingRegion = await Region_1.default.findOne({ where: { code } });
                if (existingRegion) {
                    res.status(400).json({ status: 'error', message: 'Region code already exists' });
                    return;
                }
            }
            // 更新区域基本信息
            await region.update({
                name,
                code,
                type,
            });
            // 更新国家关联
            await RegionCountry_1.default.destroy({ where: { region_id: id } });
            if (country_ids && country_ids.length > 0) {
                const regionCountries = country_ids.map((countryId) => ({
                    region_id: id,
                    country_id: countryId
                }));
                await RegionCountry_1.default.bulkCreate(regionCountries);
            }
            // 处理邮政编码关联
            let finalPostalCodeIds = [...postal_code_ids];
            // 如果有邮政编码文本输入，解析并创建/获取对应的邮政编码记录
            if (postal_code_text && postal_code_text.trim()) {
                // 解析邮政编码文本
                const postalCodePatterns = postal_code_text.trim().split(/[,\s]+/).filter((pc) => pc.trim());
                // 处理每个邮政编码模式
                for (const pattern of postalCodePatterns) {
                    // 检查是否已存在该邮政编码
                    let postalCode = await PostalCode_1.default.findOne({ where: { code: pattern } });
                    // 如果不存在，创建新的邮政编码记录
                    if (!postalCode) {
                        // 为每个选中国家创建邮政编码记录
                        for (const countryId of country_ids) {
                            postalCode = await PostalCode_1.default.create({
                                code: pattern,
                                country_id: countryId,
                                status: 1
                            });
                            finalPostalCodeIds.push(postalCode.id);
                        }
                    }
                    else {
                        // 如果已存在，添加到关联列表
                        finalPostalCodeIds.push(postalCode.id);
                    }
                }
            }
            // 更新邮政编码关联
            await RegionPostalCode_1.default.destroy({ where: { region_id: id } });
            if (finalPostalCodeIds && finalPostalCodeIds.length > 0) {
                // 去重
                const uniquePostalCodeIds = [...new Set(finalPostalCodeIds)];
                const regionPostalCodes = uniquePostalCodeIds.map((postalCodeId) => ({
                    region_id: id,
                    postal_code_id: postalCodeId
                }));
                await RegionPostalCode_1.default.bulkCreate(regionPostalCodes);
            }
            // 重新查询包含关联数据的区域
            const updatedRegion = await Region_1.default.findByPk(id, {
                include: [
                    {
                        model: Country_1.default,
                        as: 'countries',
                        through: { attributes: [] },
                        attributes: ['id', 'name', 'code', 'iso_code']
                    },
                    {
                        model: PostalCode_1.default,
                        as: 'postalCodes',
                        through: { attributes: [] },
                        attributes: ['id', 'code', 'country_id']
                    }
                ],
            });
            res.status(200).json({ status: 'success', data: updatedRegion });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to update region' });
        }
    },
    // 删除区域
    deleteRegion: async (req, res) => {
        try {
            const { id } = req.params;
            const region = await Region_1.default.findByPk(id);
            if (!region) {
                res.status(404).json({ status: 'error', message: 'Region not found' });
                return;
            }
            // 删除关联数据
            await RegionCountry_1.default.destroy({ where: { region_id: id } });
            await RegionPostalCode_1.default.destroy({ where: { region_id: id } });
            // 删除区域
            await region.destroy();
            res.status(200).json({ status: 'success', message: 'Region deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to delete region' });
        }
    },
    // 启用/禁用区域
    updateRegionStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const region = await Region_1.default.findByPk(id);
            if (!region) {
                res.status(404).json({ status: 'error', message: 'Region not found' });
                return;
            }
            await region.update({ status });
            res.status(200).json({ status: 'success', data: region });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to update region status' });
        }
    },
    // 获取所有国家（用于选择）
    getAllCountries: async (req, res) => {
        try {
            const countries = await Country_1.default.findAll({
                where: { status: 1 },
                attributes: ['id', 'name', 'code', 'iso_code'],
                order: [['name', 'ASC']]
            });
            res.status(200).json({ status: 'success', data: countries });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to get countries' });
        }
    },
    // 根据国家ID获取邮政编码
    getPostalCodesByCountryId: async (req, res) => {
        try {
            const { countryId } = req.params;
            const postalCodes = await PostalCode_1.default.findAll({
                where: {
                    country_id: countryId,
                    status: 1
                },
                attributes: ['id', 'code', 'country_id'],
                order: [['code', 'ASC']]
            });
            res.status(200).json({ status: 'success', data: postalCodes });
        }
        catch (error) {
            console.error('获取邮政编码失败:', error);
            res.status(500).json({ status: 'error', message: 'Failed to get postal codes' });
        }
    },
};
exports.default = regionController;
//# sourceMappingURL=region.js.map