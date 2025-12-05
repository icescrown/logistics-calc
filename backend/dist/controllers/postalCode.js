"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const PostalCode_1 = __importDefault(require("../models/PostalCode"));
const Country_1 = __importDefault(require("../models/Country"));
const postalCodeController = {
    // 获取所有邮政编码
    getAllPostalCodes: async (req, res) => {
        try {
            const { page = 1, page_size = 10, keyword = '' } = req.query;
            const pageInt = parseInt(page, 10);
            const pageSizeInt = parseInt(page_size, 10);
            const offset = (pageInt - 1) * pageSizeInt;
            // 构建查询条件
            const where = {};
            if (keyword) {
                where[sequelize_1.Op.or] = [
                    { code: { [sequelize_1.Op.like]: `%${keyword}%` } },
                ];
            }
            // 获取总记录数
            const total = await PostalCode_1.default.count({
                where,
                include: [
                    {
                        model: Country_1.default,
                        where: keyword ? {
                            name: { [sequelize_1.Op.like]: `%${keyword}%` }
                        } : {},
                        attributes: []
                    }
                ]
            });
            // 获取分页数据
            const postalCodes = await PostalCode_1.default.findAll({
                where,
                include: [
                    {
                        model: Country_1.default,
                        attributes: ['id', 'name', 'code', 'iso_code']
                    }
                ],
                order: [['create_time', 'DESC']],
                offset,
                limit: pageSizeInt,
            });
            res.status(200).json({
                status: 'success',
                data: {
                    list: postalCodes,
                    total,
                    page: pageInt,
                    page_size: pageSizeInt
                }
            });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to get postal codes' });
        }
    },
    // 获取单个邮政编码
    getPostalCodeById: async (req, res) => {
        try {
            const { id } = req.params;
            const postalCode = await PostalCode_1.default.findByPk(id, {
                include: [
                    {
                        model: Country_1.default,
                        attributes: ['id', 'name', 'code', 'iso_code']
                    }
                ],
            });
            if (!postalCode) {
                res.status(404).json({ status: 'error', message: 'Postal code not found' });
                return;
            }
            res.status(200).json({ status: 'success', data: postalCode });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to get postal code' });
        }
    },
    // 创建邮政编码
    createPostalCode: async (req, res) => {
        try {
            const { code, country_id } = req.body;
            // 验证必填字段
            if (!code || !country_id) {
                res.status(400).json({ status: 'error', message: 'Code and country_id are required' });
                return;
            }
            // 检查是否已存在相同的邮政编码和国家组合
            const existingPostalCode = await PostalCode_1.default.findOne({
                where: {
                    code,
                    country_id
                }
            });
            if (existingPostalCode) {
                res.status(400).json({ status: 'error', message: 'Postal code already exists for this country' });
                return;
            }
            // 创建邮政编码
            const postalCode = await PostalCode_1.default.create({
                code,
                country_id,
                status: 1,
            });
            res.status(201).json({ status: 'success', data: postalCode });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to create postal code' });
        }
    },
    // 更新邮政编码
    updatePostalCode: async (req, res) => {
        try {
            const { id } = req.params;
            const { code, country_id } = req.body;
            const postalCode = await PostalCode_1.default.findByPk(id);
            if (!postalCode) {
                res.status(404).json({ status: 'error', message: 'Postal code not found' });
                return;
            }
            // 检查是否已存在相同的邮政编码和国家组合（排除当前记录）
            if (code && country_id && (code !== postalCode.code || country_id !== postalCode.country_id)) {
                const existingPostalCode = await PostalCode_1.default.findOne({
                    where: {
                        code,
                        country_id,
                        id: { [sequelize_1.Op.ne]: id }
                    }
                });
                if (existingPostalCode) {
                    res.status(400).json({ status: 'error', message: 'Postal code already exists for this country' });
                    return;
                }
            }
            // 更新邮政编码
            await postalCode.update({
                code,
                country_id,
            });
            res.status(200).json({ status: 'success', data: postalCode });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to update postal code' });
        }
    },
    // 删除邮政编码
    deletePostalCode: async (req, res) => {
        try {
            const { id } = req.params;
            const postalCode = await PostalCode_1.default.findByPk(id);
            if (!postalCode) {
                res.status(404).json({ status: 'error', message: 'Postal code not found' });
                return;
            }
            await postalCode.destroy();
            res.status(200).json({ status: 'success', message: 'Postal code deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to delete postal code' });
        }
    },
    // 启用/禁用邮政编码
    updatePostalCodeStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const postalCode = await PostalCode_1.default.findByPk(id);
            if (!postalCode) {
                res.status(404).json({ status: 'error', message: 'Postal code not found' });
                return;
            }
            await postalCode.update({ status });
            res.status(200).json({ status: 'success', data: postalCode });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to update postal code status' });
        }
    },
};
exports.default = postalCodeController;
//# sourceMappingURL=postalCode.js.map