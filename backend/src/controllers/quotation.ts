import express from 'express';
import { Op } from 'sequelize';
import Quotation from '../models/Quotation';
import Carrier from '../models/Carrier';
import LogisticsMethod from '../models/LogisticsMethod';
import Region from '../models/Region';
import AdditionalFee from '../models/AdditionalFee';
import QuotationAdditionalFee from '../models/QuotationAdditionalFee';
import QuotationWeightRange from '../models/QuotationWeightRange';

const quotationController = {
  // 获取所有报价
  getAllQuotations: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { page = 1, page_size = 10, keyword = '' } = req.query;
      const pageInt = parseInt(page as string, 10);
      const pageSizeInt = parseInt(page_size as string, 10);
      const offset = (pageInt - 1) * pageSizeInt;
      
      // 构建查询条件
      const where: any = {};
      
      // 获取总记录数
      const total = await Quotation.count({ where });
      
      // 获取分页数据，包含关联的重量范围
      const quotations = await Quotation.findAll({
        where,
        include: [
          { model: Carrier, attributes: ['id', 'name'], as: 'carrier' },
          { model: LogisticsMethod, attributes: ['id', 'name'], as: 'logistics_method' },
          { model: Region, attributes: ['id', 'name'], as: 'region' },
          { model: QuotationWeightRange, as: 'quotation_weight_ranges' }
        ],
        order: [['create_time', 'DESC']],
        offset,
        limit: pageSizeInt,
      });
      
      res.status(200).json({ 
        status: 'success', 
        data: {
          list: quotations,
          total,
          page: pageInt,
          page_size: pageSizeInt
        } 
      });
    } catch (error) {
      console.error('获取报价失败:', error);
      res.status(500).json({ status: 'error', message: 'Failed to get quotations', error: error instanceof Error ? error.message : String(error) });
    }
  },

  // 获取单个报价
  getQuotationById: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const quotation = await Quotation.findByPk(id, {
        include: [
          { model: Carrier, as: 'carrier' },
          { model: LogisticsMethod, as: 'logistics_method' },
          { model: Region, as: 'region' },
          {
            model: QuotationAdditionalFee,
            as: 'quotation_additional_fees',
            include: [{ model: AdditionalFee, as: 'additional_fee' }],
          },
          { model: QuotationWeightRange, as: 'quotation_weight_ranges' }
        ],
      });
      if (!quotation) {
        res.status(404).json({ status: 'error', message: 'Quotation not found' });
        return;
      }
      res.status(200).json({ status: 'success', data: quotation });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to get quotation' });
    }
  },

  // 根据条件获取报价
  searchQuotations: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { carrier_id, logistics_method_id, region_id, weight, volume, effective_date } = req.query;
      
      const where: any = {};
      
      if (carrier_id) {
        where.carrier_id = carrier_id;
      }
      
      if (logistics_method_id) {
        where.logistics_method_id = logistics_method_id;
      }
      
      if (region_id) {
        where.region_id = region_id;
      }
      
      if (weight) {
        where.weight_from = { [Op.lte]: weight };
        where.weight_to = { [Op.gte]: weight };
      }
      
      if (volume) {
        where.volume_from = { [Op.lte]: volume };
        where.volume_to = { [Op.gte]: volume };
      }
      
      if (effective_date) {
        where.effective_date = { [Op.lte]: effective_date };
        where.expire_date = { [Op.or]: [{ [Op.gte]: effective_date }, { [Op.is]: null }] };
      }
      
      const quotations = await Quotation.findAll({
        where,
        include: [
          { model: Carrier, as: 'carrier' },
          { model: LogisticsMethod, as: 'logistics_method' },
          { model: Region, as: 'region' }
        ],
        order: [['create_time', 'DESC']],
      });
      
      res.status(200).json({ status: 'success', data: quotations });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to search quotations' });
    }
  },

  // 创建报价
  createQuotation: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      console.log('Received createQuotation request with body:', req.body);
      
      const { 
        carrier_id, 
        logistics_method_id, 
        region_id, 
        weight_ranges, 
        discount, 
        effective_date, 
        expire_date, 
        additional_fees 
      } = req.body;
      
      // 验证必填字段
      if (!carrier_id || !logistics_method_id || !region_id || !weight_ranges || weight_ranges.length === 0 || !effective_date) {
        res.status(400).json({ status: 'error', message: 'Required fields are missing' });
        return;
      }
      
      // 验证每个重量范围的必填字段
      for (const range of weight_ranges) {
        // Convert values to numbers for validation and storage
        const weightFrom = parseFloat(range.weight_from);
        const weightTo = parseFloat(range.weight_to);
        const basePrice = parseFloat(range.base_price);
        const additionalWeight = parseFloat(range.additional_weight || '0');
        const additionalWeightPrice = parseFloat(range.additional_weight_price || '0');
        
        // Validate converted values
        if (isNaN(weightFrom) || isNaN(weightTo) || isNaN(basePrice)) {
          res.status(400).json({ status: 'error', message: '每个重量范围必须包含有效的起始重量、结束重量和基础价格' });
          return;
        }
        if (weightFrom < 0 || weightTo <= 0 || basePrice <= 0) {
          res.status(400).json({ status: 'error', message: '起始重量必须大于等于0，结束重量和基础价格必须大于0' });
          return;
        }
        if (weightFrom >= weightTo) {
          res.status(400).json({ status: 'error', message: '每个重量范围的起始重量必须小于结束重量' });
          return;
        }
      }
      
      // 验证重量范围的非重叠性
      if (weight_ranges.length > 1) {
        // 对重量范围按照起始重量排序（转换为数字后排序）
        const sortedRanges = [...weight_ranges].sort((a, b) => parseFloat(a.weight_from) - parseFloat(b.weight_from));
        
        // 检查是否有重叠
        for (let i = 0; i < sortedRanges.length - 1; i++) {
          const currentRange = sortedRanges[i];
          const nextRange = sortedRanges[i + 1];
          
          // Convert to numbers for comparison
          const currentWeightTo = parseFloat(currentRange.weight_to);
          const nextWeightFrom = parseFloat(nextRange.weight_from);
          
          // 检查重叠
          if (nextWeightFrom < currentWeightTo) {
            res.status(400).json({ status: 'error', message: '重量范围重叠：第 ' + (i + 1) + ' 行的结束重量(' + currentRange.weight_to + ')大于第 ' + (i + 2) + ' 行的起始重量(' + nextRange.weight_from + ')' });
            return;
          }
        }
      }
      
      // 检查承运商是否存在
      const carrier = await Carrier.findByPk(carrier_id);
      if (!carrier) {
        res.status(400).json({ status: 'error', message: 'Carrier not found' });
        return;
      }
      
      // 检查物流方式是否存在
      const logisticsMethod = await LogisticsMethod.findByPk(logistics_method_id);
      if (!logisticsMethod) {
        res.status(400).json({ status: 'error', message: 'Logistics method not found' });
        return;
      }
      
      // 检查区域是否存在
      const region = await Region.findByPk(region_id);
      if (!region) {
        res.status(400).json({ status: 'error', message: 'Region not found' });
        return;
      }
      
      // 创建报价
      const quotation = await Quotation.create({
        carrier_id,
        logistics_method_id,
        region_id,
        discount: discount || 1.00,
        effective_date,
        expire_date,
        status: 1,
      });
      
      // 创建报价重量范围
      console.log('Creating weight ranges with data:', weight_ranges);
      for (const range of weight_ranges) {
        const parsedRange = {
          quotation_id: quotation.id,
          weight_from: parseFloat(range.weight_from),
          weight_to: parseFloat(range.weight_to),
          base_price: parseFloat(range.base_price),
          additional_weight: parseFloat(range.additional_weight || '0'),
          additional_weight_price: parseFloat(range.additional_weight_price || '0'),
        };
        console.log('Parsed range before creation:', parsedRange);
        await QuotationWeightRange.create(parsedRange);
      }
      
      // 创建报价附加费用
      if (additional_fees && Array.isArray(additional_fees)) {
        for (const fee of additional_fees) {
          // 检查附加费用是否存在
          const additionalFee = await AdditionalFee.findByPk(fee.additional_fee_id);
          if (additionalFee) {
            await QuotationAdditionalFee.create({
              quotation_id: quotation.id,
              additional_fee_id: fee.additional_fee_id,
              amount: fee.amount,
              calculation_rule: fee.calculation_rule,
            });
          }
        }
      }
      
      // 重新查询包含关联数据的报价
      const createdQuotation = await Quotation.findByPk(quotation.id, {
        include: [
          { model: Carrier, attributes: ['id', 'name'], as: 'carrier' },
          { model: LogisticsMethod, attributes: ['id', 'name'], as: 'logistics_method' },
          { model: Region, attributes: ['id', 'name'], as: 'region' },
          { model: QuotationWeightRange, as: 'quotation_weight_ranges' }
        ],
      });
      
      res.status(201).json({ status: 'success', data: createdQuotation });
    } catch (error) {
      console.error('创建报价失败:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to create quotation',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // 更新报价
  updateQuotation: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { 
        carrier_id, 
        logistics_method_id, 
        region_id, 
        weight_ranges, 
        discount, 
        effective_date, 
        expire_date, 
        additional_fees 
      } = req.body;
      
      // 检查报价是否存在
      const quotation = await Quotation.findByPk(id);
      if (!quotation) {
        res.status(404).json({ status: 'error', message: 'Quotation not found' });
        return;
      }
      
      // 检查承运商是否存在
      if (carrier_id) {
        const carrier = await Carrier.findByPk(carrier_id);
        if (!carrier) {
          res.status(400).json({ status: 'error', message: 'Carrier not found' });
          return;
        }
      }
      
      // 检查物流方式是否存在
      if (logistics_method_id) {
        const logisticsMethod = await LogisticsMethod.findByPk(logistics_method_id);
        if (!logisticsMethod) {
          res.status(400).json({ status: 'error', message: 'Logistics method not found' });
          return;
        }
      }
      
      // 检查区域是否存在
      if (region_id) {
        const region = await Region.findByPk(region_id);
        if (!region) {
          res.status(400).json({ status: 'error', message: 'Region not found' });
          return;
        }
      }
      
      // 验证必填字段
      if (weight_ranges && weight_ranges.length > 0) {
        // 验证每个重量范围的必填字段
        for (const range of weight_ranges) {
          // Convert values to numbers for validation
          const weightFrom = parseFloat(range.weight_from);
          const weightTo = parseFloat(range.weight_to);
          const basePrice = parseFloat(range.base_price);
          const additionalWeight = parseFloat(range.additional_weight || '0');
          const additionalWeightPrice = parseFloat(range.additional_weight_price || '0');
          
          // Validate converted values
          if (isNaN(weightFrom) || isNaN(weightTo) || isNaN(basePrice)) {
            res.status(400).json({ status: 'error', message: '每个重量范围必须包含有效的起始重量、结束重量和基础价格' });
            return;
          }
          if (weightFrom < 0 || weightTo <= 0 || basePrice <= 0) {
            res.status(400).json({ status: 'error', message: '起始重量必须大于等于0，结束重量和基础价格必须大于0' });
            return;
          }
          if (weightFrom >= weightTo) {
            res.status(400).json({ status: 'error', message: '每个重量范围的起始重量必须小于结束重量' });
            return;
          }
        }
        
        // 验证重量范围的非重叠性
        if (weight_ranges.length > 1) {
          // 对重量范围按照起始重量排序（转换为数字后排序）
          const sortedRanges = [...weight_ranges].sort((a, b) => parseFloat(a.weight_from) - parseFloat(b.weight_from));
          
          // 检查是否有重叠
          for (let i = 0; i < sortedRanges.length - 1; i++) {
            const currentRange = sortedRanges[i];
            const nextRange = sortedRanges[i + 1];
            
            // Convert to numbers for comparison
            const currentWeightTo = parseFloat(currentRange.weight_to);
            const nextWeightFrom = parseFloat(nextRange.weight_from);
            
            // 检查重叠
            if (nextWeightFrom < currentWeightTo) {
              res.status(400).json({ status: 'error', message: '重量范围重叠：第 ' + (i + 1) + ' 行的结束重量(' + currentRange.weight_to + ')大于第 ' + (i + 2) + ' 行的起始重量(' + nextRange.weight_from + ')' });
              return;
            }
          }
        }
      }
      
      // 更新报价基本信息
      await quotation.update({
        carrier_id,
        logistics_method_id,
        region_id,
        discount,
        effective_date,
        expire_date,
      });
      
      // 更新报价重量范围
      if (weight_ranges) {
        // 删除现有的重量范围
        await QuotationWeightRange.destroy({ where: { quotation_id: id } });
        
        // 创建新的重量范围
        for (const range of weight_ranges) {
          await QuotationWeightRange.create({
            quotation_id: quotation.id,
            weight_from: parseFloat(range.weight_from),
            weight_to: parseFloat(range.weight_to),
            base_price: parseFloat(range.base_price),
            additional_weight: parseFloat(range.additional_weight || '0'),
            additional_weight_price: parseFloat(range.additional_weight_price || '0'),
          });
        }
      }
      
      // 更新报价附加费用
      if (additional_fees && Array.isArray(additional_fees)) {
        // 删除现有的报价附加费用
        await QuotationAdditionalFee.destroy({ where: { quotation_id: id } });
        
        // 创建新的报价附加费用
        for (const fee of additional_fees) {
          // 检查附加费用是否存在
          const additionalFee = await AdditionalFee.findByPk(fee.additional_fee_id);
          if (additionalFee) {
            await QuotationAdditionalFee.create({
              quotation_id: quotation.id,
              additional_fee_id: fee.additional_fee_id,
              amount: fee.amount,
              calculation_rule: fee.calculation_rule,
            });
          }
        }
      }
      
      // 重新查询包含关联数据的报价
      const updatedQuotation = await Quotation.findByPk(quotation.id, {
        include: [
          { model: Carrier, attributes: ['id', 'name'], as: 'carrier' },
          { model: LogisticsMethod, attributes: ['id', 'name'], as: 'logistics_method' },
          { model: Region, attributes: ['id', 'name'], as: 'region' },
          { model: QuotationWeightRange, as: 'quotation_weight_ranges' }
        ],
      });
      
      res.status(200).json({ status: 'success', data: updatedQuotation });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to update quotation' });
    }
  },

  // 删除报价
  deleteQuotation: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // 检查报价是否存在
      const quotation = await Quotation.findByPk(id);
      if (!quotation) {
        res.status(404).json({ status: 'error', message: 'Quotation not found' });
        return;
      }
      
      // 删除报价附加费用
      await QuotationAdditionalFee.destroy({ where: { quotation_id: id } });
      
      // 删除报价
      await quotation.destroy();
      
      res.status(200).json({ status: 'success', message: 'Quotation deleted successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to delete quotation' });
    }
  },

  // 启用/禁用报价
  updateQuotationStatus: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // 检查报价是否存在
      const quotation = await Quotation.findByPk(id);
      if (!quotation) {
        res.status(404).json({ status: 'error', message: 'Quotation not found' });
        return;
      }
      
      // 更新报价状态
      await quotation.update({ status });
      
      res.status(200).json({ status: 'success', data: quotation });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to update quotation status' });
    }
  },

  // 导入报价
  importQuotations: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      // 这里需要实现Excel导入功能，使用multer处理文件上传，使用SheetJS解析Excel文件
      // 由于这是一个示例，我们先返回一个占位符响应
      res.status(200).json({ status: 'success', message: 'Quotations imported successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to import quotations' });
    }
  },

  // 导出报价
  exportQuotations: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      // 这里需要实现Excel导出功能，使用SheetJS生成Excel文件
      // 由于这是一个示例，我们先返回一个占位符响应
      res.status(200).json({ status: 'success', message: 'Quotations exported successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to export quotations' });
    }
  },
};

export default quotationController;