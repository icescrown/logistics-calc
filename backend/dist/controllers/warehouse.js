"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Warehouse_1 = __importDefault(require("../models/Warehouse"));
const warehouseController = {
    // 获取所有仓库
    getAllWarehouses: async (req, res) => {
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
                    { address: { [sequelize_1.Op.like]: `%${keyword}%` } },
                ];
            }
            // 获取总记录数
            const total = await Warehouse_1.default.count({ where });
            // 获取分页数据
            const warehouses = await Warehouse_1.default.findAll({
                where,
                order: [['create_time', 'DESC']],
                offset,
                limit: pageSizeInt,
            });
            res.status(200).json({
                status: 'success',
                data: {
                    list: warehouses,
                    total,
                    page: pageInt,
                    page_size: pageSizeInt
                }
            });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to get warehouses' });
        }
    },
    // 获取单个仓库
    getWarehouseById: async (req, res) => {
        try {
            const { id } = req.params;
            const warehouse = await Warehouse_1.default.findByPk(id);
            if (!warehouse) {
                res.status(404).json({ status: 'error', message: 'Warehouse not found' });
                return;
            }
            res.status(200).json({ status: 'success', data: warehouse });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to get warehouse' });
        }
    },
    // 创建仓库
    createWarehouse: async (req, res) => {
        try {
            const { name, code, address, contact, phone } = req.body;
            // 验证必填字段
            if (!name || !code) {
                res.status(400).json({ status: 'error', message: 'Name and code are required' });
                return;
            }
            // 检查code是否已存在
            const existingWarehouse = await Warehouse_1.default.findOne({ where: { code } });
            if (existingWarehouse) {
                res.status(400).json({ status: 'error', message: 'Warehouse code already exists' });
                return;
            }
            const warehouse = await Warehouse_1.default.create({
                name,
                code,
                address,
                contact,
                phone,
                status: 1,
            });
            res.status(201).json({ status: 'success', data: warehouse });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to create warehouse' });
        }
    },
    // 更新仓库
    updateWarehouse: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, code, address, contact, phone } = req.body;
            const warehouse = await Warehouse_1.default.findByPk(id);
            if (!warehouse) {
                res.status(404).json({ status: 'error', message: 'Warehouse not found' });
                return;
            }
            // 检查code是否已存在（排除当前仓库）
            if (code && code !== warehouse.code) {
                const existingWarehouse = await Warehouse_1.default.findOne({ where: { code } });
                if (existingWarehouse) {
                    res.status(400).json({ status: 'error', message: 'Warehouse code already exists' });
                    return;
                }
            }
            await warehouse.update({
                name,
                code,
                address,
                contact,
                phone,
            });
            res.status(200).json({ status: 'success', data: warehouse });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to update warehouse' });
        }
    },
    // 删除仓库
    deleteWarehouse: async (req, res) => {
        try {
            const { id } = req.params;
            const warehouse = await Warehouse_1.default.findByPk(id);
            if (!warehouse) {
                res.status(404).json({ status: 'error', message: 'Warehouse not found' });
                return;
            }
            await warehouse.destroy();
            res.status(200).json({ status: 'success', message: 'Warehouse deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to delete warehouse' });
        }
    },
    // 启用/禁用仓库
    updateWarehouseStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const warehouse = await Warehouse_1.default.findByPk(id);
            if (!warehouse) {
                res.status(404).json({ status: 'error', message: 'Warehouse not found' });
                return;
            }
            await warehouse.update({ status });
            res.status(200).json({ status: 'success', data: warehouse });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to update warehouse status' });
        }
    },
};
exports.default = warehouseController;
//# sourceMappingURL=warehouse.js.map