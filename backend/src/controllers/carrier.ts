import express from 'express';
import { Op } from 'sequelize';
import Carrier from '../models/Carrier';

const carrierController = {
  // 获取所有承运商
  getAllCarriers: async (req: express.Request, res: express.Response): Promise<void> => {
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
      ];
    }
      
      // 获取总记录数
      const total = await Carrier.count({ where });
      
      // 获取分页数据
      const carriers = await Carrier.findAll({
        where,
        order: [['create_time', 'DESC']],
        offset,
        limit: pageSizeInt,
      });
      
      res.status(200).json({ 
        status: 'success', 
        data: {
          list: carriers,
          total,
          page: pageInt,
          page_size: pageSizeInt
        } 
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to get carriers' });
    }
  },

  // 获取单个承运商
  getCarrierById: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const carrier = await Carrier.findByPk(id);
      if (!carrier) {
        res.status(404).json({ status: 'error', message: 'Carrier not found' });
        return;
      }
      res.status(200).json({ status: 'success', data: carrier });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to get carrier' });
    }
  },

  // 创建承运商
  createCarrier: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { name, code, contact, phone, email } = req.body;
      
      // 验证必填字段
      if (!name || !code) {
        res.status(400).json({ status: 'error', message: 'Name and code are required' });
        return;
      }
      
      // 检查code是否已存在
      const existingCarrier = await Carrier.findOne({ where: { code } });
      if (existingCarrier) {
        res.status(400).json({ status: 'error', message: 'Carrier code already exists' });
        return;
      }
      
      const carrier = await Carrier.create({
        name,
        code,
        contact,
        phone,
        email,
        status: 1,
      });
      
      res.status(201).json({ status: 'success', data: carrier });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to create carrier' });
    }
  },

  // 更新承运商
  updateCarrier: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, code, contact, phone, email } = req.body;
      
      const carrier = await Carrier.findByPk(id);
      if (!carrier) {
        res.status(404).json({ status: 'error', message: 'Carrier not found' });
        return;
      }
      
      // 检查code是否已存在（排除当前承运商）
      if (code && code !== carrier.code) {
        const existingCarrier = await Carrier.findOne({ where: { code } });
        if (existingCarrier) {
          res.status(400).json({ status: 'error', message: 'Carrier code already exists' });
          return;
        }
      }
      
      await carrier.update({
        name,
        code,
        contact,
        phone,
        email,
      });
      
      res.status(200).json({ status: 'success', data: carrier });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to update carrier' });
    }
  },

  // 删除承运商
  deleteCarrier: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const carrier = await Carrier.findByPk(id);
      if (!carrier) {
        res.status(404).json({ status: 'error', message: 'Carrier not found' });
        return;
      }
      
      await carrier.destroy();
      res.status(200).json({ status: 'success', message: 'Carrier deleted successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to delete carrier' });
    }
  },

  // 启用/禁用承运商
  updateCarrierStatus: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const carrier = await Carrier.findByPk(id);
      if (!carrier) {
        res.status(404).json({ status: 'error', message: 'Carrier not found' });
        return;
      }
      
      await carrier.update({ status });
      res.status(200).json({ status: 'success', data: carrier });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to update carrier status' });
    }
  },
};

export default carrierController;