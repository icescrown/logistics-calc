import express from 'express';
import { Op } from 'sequelize';
import LogisticsMethod from '../models/LogisticsMethod';
import Carrier from '../models/Carrier';

const logisticsMethodController = {
  // 获取所有物流方式
  getAllLogisticsMethods: async (req: express.Request, res: express.Response): Promise<void> => {
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
      const total = await LogisticsMethod.count({
        where,
      });
      
      // 获取分页数据
      const logisticsMethods = await LogisticsMethod.findAll({
        where,
        order: [['create_time', 'DESC']],
        offset,
        limit: pageSizeInt,
      });
      
      res.status(200).json({ 
        status: 'success', 
        data: {
          list: logisticsMethods,
          total,
          page: pageInt,
          page_size: pageSizeInt
        } 
      });
    } catch (error) {
      console.error('获取物流方式失败:', error);
      res.status(500).json({ status: 'error', message: 'Failed to get logistics methods' });
    }
  },

  // 获取单个物流方式
  getLogisticsMethodById: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const logisticsMethod = await LogisticsMethod.findByPk(id, {
        include: [Carrier],
      });
      if (!logisticsMethod) {
        res.status(404).json({ status: 'error', message: 'Logistics method not found' });
        return;
      }
      res.status(200).json({ status: 'success', data: logisticsMethod });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to get logistics method' });
    }
  },

  // 根据承运商获取物流方式
  getLogisticsMethodsByCarrier: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { carrierId } = req.params;
      const { page = 1, page_size = 10, keyword = '' } = req.query;
      const pageInt = parseInt(page as string, 10);
      const pageSizeInt = parseInt(page_size as string, 10);
      const offset = (pageInt - 1) * pageSizeInt;
      
      // 构建查询条件
    const where: any = { carrier_id: carrierId };
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
      ];
    }
      
      // 获取总记录数
      const total = await LogisticsMethod.count({
        where,
        include: [Carrier],
      });
      
      // 获取分页数据
      const logisticsMethods = await LogisticsMethod.findAll({
        where,
        include: [Carrier],
        order: [['create_time', 'DESC']],
        offset,
        limit: pageSizeInt,
      });
      
      res.status(200).json({ 
        status: 'success', 
        data: {
          list: logisticsMethods,
          total,
          page: pageInt,
          page_size: pageSizeInt
        } 
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to get logistics methods by carrier' });
    }
  },

  // 创建物流方式
  createLogisticsMethod: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { name, code, carrier_id, type, description } = req.body;
      
      // 验证必填字段
      if (!name || !code || !carrier_id) {
        res.status(400).json({ status: 'error', message: 'Name, code and carrier_id are required' });
        return;
      }
      
      // 检查code是否已存在
      const existingLogisticsMethod = await LogisticsMethod.findOne({ where: { code } });
      if (existingLogisticsMethod) {
        res.status(400).json({ status: 'error', message: 'Logistics method code already exists' });
        return;
      }
      
      // 检查承运商是否存在
      const carrier = await Carrier.findByPk(carrier_id);
      if (!carrier) {
        res.status(400).json({ status: 'error', message: 'Carrier not found' });
        return;
      }
      
      const logisticsMethod = await LogisticsMethod.create({
        name,
        code,
        carrier_id,
        type,
        description,
        status: 1,
      });
      
      res.status(201).json({ status: 'success', data: logisticsMethod });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to create logistics method' });
    }
  },

  // 更新物流方式
  updateLogisticsMethod: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, code, carrier_id, type, description } = req.body;
      
      const logisticsMethod = await LogisticsMethod.findByPk(id);
      if (!logisticsMethod) {
        res.status(404).json({ status: 'error', message: 'Logistics method not found' });
        return;
      }
      
      // 检查code是否已存在（排除当前物流方式）
      if (code && code !== logisticsMethod.code) {
        const existingLogisticsMethod = await LogisticsMethod.findOne({ where: { code } });
        if (existingLogisticsMethod) {
          res.status(400).json({ status: 'error', message: 'Logistics method code already exists' });
          return;
        }
      }
      
      // 检查承运商是否存在
      if (carrier_id && carrier_id !== logisticsMethod.carrier_id) {
        const carrier = await Carrier.findByPk(carrier_id);
        if (!carrier) {
          res.status(400).json({ status: 'error', message: 'Carrier not found' });
          return;
        }
      }
      
      await logisticsMethod.update({
        name,
        code,
        carrier_id,
        type,
        description,
      });
      
      res.status(200).json({ status: 'success', data: logisticsMethod });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to update logistics method' });
    }
  },

  // 删除物流方式
  deleteLogisticsMethod: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const logisticsMethod = await LogisticsMethod.findByPk(id);
      if (!logisticsMethod) {
        res.status(404).json({ status: 'error', message: 'Logistics method not found' });
        return;
      }
      
      await logisticsMethod.destroy();
      res.status(200).json({ status: 'success', message: 'Logistics method deleted successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to delete logistics method' });
    }
  },

  // 启用/禁用物流方式
  updateLogisticsMethodStatus: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const logisticsMethod = await LogisticsMethod.findByPk(id);
      if (!logisticsMethod) {
        res.status(404).json({ status: 'error', message: 'Logistics method not found' });
        return;
      }
      
      await logisticsMethod.update({ status });
      res.status(200).json({ status: 'success', data: logisticsMethod });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to update logistics method status' });
    }
  },
};

export default logisticsMethodController;