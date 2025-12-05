import express from 'express';
import { Op } from 'sequelize';
import PostalCode from '../models/PostalCode';
import Country from '../models/Country';

const postalCodeController = {
  // 获取所有邮政编码
  getAllPostalCodes: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { page = 1, page_size = 10, keyword = '' } = req.query;
      const pageInt = parseInt(page as string, 10);
      const pageSizeInt = parseInt(page_size as string, 10);
      const offset = (pageInt - 1) * pageSizeInt;
      
      // 构建查询条件
      const where: any = {};
      if (keyword) {
        where[Op.or] = [
          { code: { [Op.like]: `%${keyword}%` } },
        ];
      }
      
      // 获取总记录数
      const total = await PostalCode.count({ 
        where,
        include: [
          {
            model: Country,
            where: keyword ? {
              name: { [Op.like]: `%${keyword}%` }
            } : {},
            attributes: []
          }
        ]
      });
      
      // 获取分页数据
      const postalCodes = await PostalCode.findAll({
        where,
        include: [
          {
            model: Country,
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
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to get postal codes' });
    }
  },

  // 获取单个邮政编码
  getPostalCodeById: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const postalCode = await PostalCode.findByPk(id, {
        include: [
          {
            model: Country,
            attributes: ['id', 'name', 'code', 'iso_code']
          }
        ],
      });
      if (!postalCode) {
        res.status(404).json({ status: 'error', message: 'Postal code not found' });
        return;
      }
      res.status(200).json({ status: 'success', data: postalCode });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to get postal code' });
    }
  },

  // 创建邮政编码
  createPostalCode: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { code, country_id } = req.body;
      
      // 验证必填字段
      if (!code || !country_id) {
        res.status(400).json({ status: 'error', message: 'Code and country_id are required' });
        return;
      }
      
      // 检查是否已存在相同的邮政编码和国家组合
      const existingPostalCode = await PostalCode.findOne({ 
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
      const postalCode = await PostalCode.create({
        code,
        country_id,
        status: 1,
      });
      
      res.status(201).json({ status: 'success', data: postalCode });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to create postal code' });
    }
  },

  // 更新邮政编码
  updatePostalCode: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { code, country_id } = req.body;
      
      const postalCode = await PostalCode.findByPk(id);
      if (!postalCode) {
        res.status(404).json({ status: 'error', message: 'Postal code not found' });
        return;
      }
      
      // 检查是否已存在相同的邮政编码和国家组合（排除当前记录）
      if (code && country_id && (code !== postalCode.code || country_id !== postalCode.country_id)) {
        const existingPostalCode = await PostalCode.findOne({ 
          where: { 
            code,
            country_id,
            id: { [Op.ne]: id }
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
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to update postal code' });
    }
  },

  // 删除邮政编码
  deletePostalCode: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const postalCode = await PostalCode.findByPk(id);
      if (!postalCode) {
        res.status(404).json({ status: 'error', message: 'Postal code not found' });
        return;
      }
      
      await postalCode.destroy();
      res.status(200).json({ status: 'success', message: 'Postal code deleted successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to delete postal code' });
    }
  },

  // 启用/禁用邮政编码
  updatePostalCodeStatus: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const postalCode = await PostalCode.findByPk(id);
      if (!postalCode) {
        res.status(404).json({ status: 'error', message: 'Postal code not found' });
        return;
      }
      
      await postalCode.update({ status });
      res.status(200).json({ status: 'success', data: postalCode });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to update postal code status' });
    }
  },
};

export default postalCodeController;