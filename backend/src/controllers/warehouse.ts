import express from 'express';
import { Op } from 'sequelize';
import Warehouse from '../models/Warehouse';

const warehouseController = {
  // 获取所有仓库
  getAllWarehouses: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { page = 1, page_size = 10, keyword = '' } = req.query;
      const pageInt = parseInt(page as string, 10);
      const pageSizeInt = parseInt(page_size as string, 10);
      const offset = (pageInt - 1) * pageSizeInt;
      
      // 构建查询条件
    const where: any = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
        { address: { [Op.like]: `%${keyword}%` } },
      ];
    }
      
      // 获取总记录数
      const total = await Warehouse.count({ where });
      
      // 获取分页数据
      const warehouses = await Warehouse.findAll({
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
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to get warehouses' });
    }
  },

  // 获取单个仓库
  getWarehouseById: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const warehouse = await Warehouse.findByPk(id);
      if (!warehouse) {
        res.status(404).json({ status: 'error', message: 'Warehouse not found' });
        return;
      }
      res.status(200).json({ status: 'success', data: warehouse });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to get warehouse' });
    }
  },

  // 创建仓库
  createWarehouse: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { name, code, address, contact, phone } = req.body;
      
      // 验证必填字段
      if (!name || !code) {
        res.status(400).json({ status: 'error', message: 'Name and code are required' });
        return;
      }
      
      // 检查code是否已存在
      const existingWarehouse = await Warehouse.findOne({ where: { code } });
      if (existingWarehouse) {
        res.status(400).json({ status: 'error', message: 'Warehouse code already exists' });
        return;
      }
      
      const warehouse = await Warehouse.create({
        name,
        code,
        address,
        contact,
        phone,
        status: 1,
      });
      
      res.status(201).json({ status: 'success', data: warehouse });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to create warehouse' });
    }
  },

  // 更新仓库
  updateWarehouse: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, code, address, contact, phone } = req.body;
      
      const warehouse = await Warehouse.findByPk(id);
      if (!warehouse) {
        res.status(404).json({ status: 'error', message: 'Warehouse not found' });
        return;
      }
      
      // 检查code是否已存在（排除当前仓库）
      if (code && code !== warehouse.code) {
        const existingWarehouse = await Warehouse.findOne({ where: { code } });
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
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to update warehouse' });
    }
  },

  // 删除仓库
  deleteWarehouse: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const warehouse = await Warehouse.findByPk(id);
      if (!warehouse) {
        res.status(404).json({ status: 'error', message: 'Warehouse not found' });
        return;
      }
      
      await warehouse.destroy();
      res.status(200).json({ status: 'success', message: 'Warehouse deleted successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to delete warehouse' });
    }
  },

  // 启用/禁用仓库
  updateWarehouseStatus: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const warehouse = await Warehouse.findByPk(id);
      if (!warehouse) {
        res.status(404).json({ status: 'error', message: 'Warehouse not found' });
        return;
      }
      
      await warehouse.update({ status });
      res.status(200).json({ status: 'success', data: warehouse });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to update warehouse status' });
    }
  },
};

export default warehouseController;