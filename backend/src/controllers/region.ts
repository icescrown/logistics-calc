import express from 'express';
import { Op } from 'sequelize';
import Region from '../models/Region';
import Country from '../models/Country';
import PostalCode from '../models/PostalCode';
import RegionCountry from '../models/RegionCountry';
import RegionPostalCode from '../models/RegionPostalCode';

const regionController = {
  // 获取所有区域
  getAllRegions: async (req: express.Request, res: express.Response): Promise<void> => {
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
      const total = await Region.count({ where });
      
      // 获取分页数据，包含关联的国家和邮政编码
      const regions = await Region.findAll({
        where,
        order: [['create_time', 'DESC']],
        offset,
        limit: pageSizeInt,
        include: [
          {
            model: Country,
            as: 'countries',
            through: { attributes: [] },
            attributes: ['id', 'name', 'code', 'iso_code']
          },
          {
            model: PostalCode,
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
    } catch (error) {
      console.error('获取区域失败:', error);
      res.status(500).json({ status: 'error', message: 'Failed to get regions' });
    }
  },

  // 获取单个区域
  getRegionById: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const region = await Region.findByPk(id, {
        include: [
          { 
            model: Country, 
            as: 'countries',
            through: { attributes: [] },
            attributes: ['id', 'name', 'code', 'iso_code']
          },
          { 
            model: PostalCode, 
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
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to get region' });
    }
  },

  // 创建区域
  createRegion: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { name, code, type, country_ids = [], postal_code_ids = [], postal_code_text = '' } = req.body;
      
      // 验证必填字段
      if (!name || !code) {
        res.status(400).json({ status: 'error', message: 'Name and code are required' });
        return;
      }
      
      // 检查code是否已存在
      const existingRegion = await Region.findOne({ where: { code } });
      if (existingRegion) {
        res.status(400).json({ status: 'error', message: 'Region code already exists' });
        return;
      }
      
      // 创建区域
      const region = await Region.create({
        name,
        code,
        type,
        status: 1,
      });
      
      // 关联国家
      if (country_ids && country_ids.length > 0) {
        const regionCountries = country_ids.map((countryId: number) => ({
          region_id: region.id,
          country_id: countryId
        }));
        await RegionCountry.bulkCreate(regionCountries);
      }
      
      // 处理邮政编码关联
      let finalPostalCodeIds = [...postal_code_ids];
      
      // 如果有邮政编码文本输入，解析并创建/获取对应的邮政编码记录
      if (postal_code_text && postal_code_text.trim()) {
        // 解析邮政编码文本
        const postalCodePatterns = postal_code_text.trim().split(/[,\s]+/).filter((pc: string) => pc.trim());
        
        // 处理每个邮政编码模式
        for (const pattern of postalCodePatterns) {
          // 检查是否已存在该邮政编码
          let postalCode = await PostalCode.findOne({ where: { code: pattern } });
          
          // 如果不存在，创建新的邮政编码记录
          if (!postalCode) {
            // 为每个选中国家创建邮政编码记录
            for (const countryId of country_ids) {
              postalCode = await PostalCode.create({
                code: pattern,
                country_id: countryId,
                status: 1
              });
              finalPostalCodeIds.push(postalCode.id);
            }
          } else {
            // 如果已存在，添加到关联列表
            finalPostalCodeIds.push(postalCode.id);
          }
        }
      }
      
      // 关联邮政编码
      if (finalPostalCodeIds && finalPostalCodeIds.length > 0) {
        // 去重
        const uniquePostalCodeIds = [...new Set(finalPostalCodeIds)];
        const regionPostalCodes = uniquePostalCodeIds.map((postalCodeId: number) => ({
          region_id: region.id,
          postal_code_id: postalCodeId
        }));
        await RegionPostalCode.bulkCreate(regionPostalCodes);
      }
      
      // 重新查询包含关联数据的区域
      const createdRegion = await Region.findByPk(region.id, {
        include: [
          { 
            model: Country, 
            as: 'countries',
            through: { attributes: [] },
            attributes: ['id', 'name', 'code', 'iso_code']
          },
          { 
            model: PostalCode, 
            as: 'postalCodes',
            through: { attributes: [] },
            attributes: ['id', 'code', 'country_id']
          }
        ],
      });
      
      res.status(201).json({ status: 'success', data: createdRegion });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to create region' });
    }
  },

  // 更新区域
  updateRegion: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, code, type, country_ids = [], postal_code_ids = [], postal_code_text = '' } = req.body;
      
      const region = await Region.findByPk(id);
      if (!region) {
        res.status(404).json({ status: 'error', message: 'Region not found' });
        return;
      }
      
      // 检查code是否已存在（排除当前区域）
      if (code && code !== region.code) {
        const existingRegion = await Region.findOne({ where: { code } });
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
      await RegionCountry.destroy({ where: { region_id: id } });
      if (country_ids && country_ids.length > 0) {
        const regionCountries = country_ids.map((countryId: number) => ({
          region_id: id,
          country_id: countryId
        }));
        await RegionCountry.bulkCreate(regionCountries);
      }
      
      // 处理邮政编码关联
      let finalPostalCodeIds = [...postal_code_ids];
      
      // 如果有邮政编码文本输入，解析并创建/获取对应的邮政编码记录
      if (postal_code_text && postal_code_text.trim()) {
        // 解析邮政编码文本
        const postalCodePatterns = postal_code_text.trim().split(/[,\s]+/).filter((pc: string) => pc.trim());
        
        // 处理每个邮政编码模式
        for (const pattern of postalCodePatterns) {
          // 检查是否已存在该邮政编码
          let postalCode = await PostalCode.findOne({ where: { code: pattern } });
          
          // 如果不存在，创建新的邮政编码记录
          if (!postalCode) {
            // 为每个选中国家创建邮政编码记录
            for (const countryId of country_ids) {
              postalCode = await PostalCode.create({
                code: pattern,
                country_id: countryId,
                status: 1
              });
              finalPostalCodeIds.push(postalCode.id);
            }
          } else {
            // 如果已存在，添加到关联列表
            finalPostalCodeIds.push(postalCode.id);
          }
        }
      }
      
      // 更新邮政编码关联
      await RegionPostalCode.destroy({ where: { region_id: id } });
      if (finalPostalCodeIds && finalPostalCodeIds.length > 0) {
        // 去重
        const uniquePostalCodeIds = [...new Set(finalPostalCodeIds)];
        const regionPostalCodes = uniquePostalCodeIds.map((postalCodeId: number) => ({
          region_id: id,
          postal_code_id: postalCodeId
        }));
        await RegionPostalCode.bulkCreate(regionPostalCodes);
      }
      
      // 重新查询包含关联数据的区域
      const updatedRegion = await Region.findByPk(id, {
        include: [
          { 
            model: Country, 
            as: 'countries',
            through: { attributes: [] },
            attributes: ['id', 'name', 'code', 'iso_code']
          },
          { 
            model: PostalCode, 
            as: 'postalCodes',
            through: { attributes: [] },
            attributes: ['id', 'code', 'country_id']
          }
        ],
      });
      
      res.status(200).json({ status: 'success', data: updatedRegion });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to update region' });
    }
  },

  // 删除区域
  deleteRegion: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const region = await Region.findByPk(id);
      if (!region) {
        res.status(404).json({ status: 'error', message: 'Region not found' });
        return;
      }
      
      // 删除关联数据
      await RegionCountry.destroy({ where: { region_id: id } });
      await RegionPostalCode.destroy({ where: { region_id: id } });
      
      // 删除区域
      await region.destroy();
      
      res.status(200).json({ status: 'success', message: 'Region deleted successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to delete region' });
    }
  },

  // 启用/禁用区域
  updateRegionStatus: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const region = await Region.findByPk(id);
      if (!region) {
        res.status(404).json({ status: 'error', message: 'Region not found' });
        return;
      }
      
      await region.update({ status });
      res.status(200).json({ status: 'success', data: region });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to update region status' });
    }
  },

  // 获取所有国家（用于选择）
  getAllCountries: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const countries = await Country.findAll({
        where: { status: 1 },
        attributes: ['id', 'name', 'code', 'iso_code'],
        order: [['name', 'ASC']]
      });
      res.status(200).json({ status: 'success', data: countries });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to get countries' });
    }
  },

  // 根据国家ID获取邮政编码
  getPostalCodesByCountryId: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { countryId } = req.params;
      const postalCodes = await PostalCode.findAll({
        where: { 
          country_id: countryId,
          status: 1 
        },
        attributes: ['id', 'code', 'country_id'],
        order: [['code', 'ASC']]
      });
      res.status(200).json({ status: 'success', data: postalCodes });
    } catch (error) {
      console.error('获取邮政编码失败:', error);
      res.status(500).json({ status: 'error', message: 'Failed to get postal codes' });
    }
  },

};

export default regionController;